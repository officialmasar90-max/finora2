import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Session } from '@supabase/supabase-js';
import type { Transaction } from '@/types/transaction';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface SendOptions {
  message: string;
  conversationId?: string;
  includeProfile: boolean;
  profileData?: {
    monthlyIncome: number;
    essentialExpenses: number;
    nonEssentialExpenses: number;
    debtBalances: number;
    monthlyInstallments: number;
    savings: number;
    financialDependents: number;
    emergencyFund: number;
    recentTransactions?: Pick<Transaction, 'description' | 'amount' | 'type' | 'category'>[];
  };
  session: Session | null;
}

export function useAIConsultant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiUnavailable, setAiUnavailable] = useState(false);
  const lastMessageRef = useRef<string>('');

  const loadConversations = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('ai_conversations')
      .select('id, title, created_at, updated_at')
      .order('updated_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setConversations((data ?? []) as Conversation[]);
    setLoading(false);
  }, []);

  const loadMessages = useCallback(async (conversationId: string) => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('ai_messages')
      .select('id, role, content, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setMessages((data ?? []) as ChatMessage[]);
    setActiveConversationId(conversationId);
    setLoading(false);
  }, []);

  const sendMessage = useCallback(async (opts: SendOptions): Promise<void> => {
    if (!opts.session) {
      setError('Anda harus masuk untuk menggunakan Konsultan AI.');
      return;
    }

    // Prevent duplicate sends of the same message
    if (lastMessageRef.current === opts.message && sending) return;
    lastMessageRef.current = opts.message;

    setError(null);
    setSending(true);
    setAiUnavailable(false);

    // Optimistically add the user's message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: opts.message,
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-consultant`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${opts.session.access_token}`,
        },
        body: JSON.stringify({
          message: opts.message,
          conversationId: opts.conversationId,
          includeProfile: opts.includeProfile,
          profileData: opts.includeProfile ? opts.profileData : undefined,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const msg =
          errorBody?.error ??
          (response.status === 429
            ? 'Batas harian tercapai. Coba lagi besok.'
            : `Permintaan gagal (${response.status})`);
        setError(msg);
        // Remove the optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
        setSending(false);
        return;
      }

      const data = await response.json();

      if (!data || typeof data.reply !== 'string') {
        setError('Respons AI tidak valid. Silakan coba lagi.');
        setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
        setSending(false);
        return;
      }

      if (data.aiUnavailable) {
        setAiUnavailable(true);
      }

      // Replace temp user message with confirmation, add assistant reply
      const assistantMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.reply,
      };
      setMessages((prev) => [...prev, assistantMsg]);

      // Update conversation ID if a new conversation was created
      if (data.conversationId && data.conversationId !== activeConversationId) {
        setActiveConversationId(data.conversationId);
        // Reload conversation list to show the new conversation
        loadConversations();
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Kesalahan jaringan. Periksa koneksi Anda.';
      setError(msg);
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMsg.id));
    } finally {
      setSending(false);
    }
  }, [activeConversationId, sending, loadConversations]);

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setActiveConversationId(null);
    setError(null);
    setAiUnavailable(false);
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    const { error: delError } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('id', conversationId);

    if (delError) {
      setError(delError.message);
      return;
    }

    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    if (activeConversationId === conversationId) {
      startNewConversation();
    }
  }, [activeConversationId, startNewConversation]);

  return {
    messages,
    conversations,
    activeConversationId,
    loading,
    sending,
    error,
    aiUnavailable,
    loadConversations,
    loadMessages,
    sendMessage,
    startNewConversation,
    deleteConversation,
    clearError: () => setError(null),
  };
}
