import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Bot,
  Send,
  Loader2,
  AlertCircle,
  Plus,
  MessageSquare,
  Trash2,
  ShieldCheck,
  Info,
  RefreshCw,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAIConsultant, type ChatMessage } from '@/hooks/useAIConsultant';
import { useTransactions } from '@/hooks/useTransactions';
import { useAssessments, toInput } from '@/hooks/useAssessments';
import { formatIDR } from '@/utils/format';

const SUGGESTED_QUESTIONS = [
  'Bagaimana cara membuat anggaran bulanan yang efektif?',
  'Berapa idealnya dana darurat yang harus saya siapkan?',
  'Strategi apa untuk melunasi utang lebih cepat?',
  'Cara menabung dengan pendapatan terbatas?',
];

export default function AIConsultantPage() {
  const { session } = useAuth();
  const {
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
    clearError,
  } = useAIConsultant();

  const { transactions } = useTransactions();
  const { assessments } = useAssessments();

  const [input, setInput] = useState('');
  const [includeProfile, setIncludeProfile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load conversation list on mount
  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const buildProfileData = useCallback(() => {
    if (!includeProfile) return undefined;

    const latestAssessment = assessments[0];
    const assessmentInput = latestAssessment ? toInput(latestAssessment) : null;

    const recentTx = transactions.slice(0, 10).map((t) => ({
      description: t.description,
      amount: Number(t.amount),
      type: t.type,
      category: t.category,
    }));

    if (!assessmentInput) {
      // Only send transaction data if no assessment exists
      return {
        monthlyIncome: 0,
        essentialExpenses: 0,
        nonEssentialExpenses: 0,
        debtBalances: 0,
        monthlyInstallments: 0,
        savings: 0,
        financialDependents: 0,
        emergencyFund: 0,
        recentTransactions: recentTx,
      };
    }

    return {
      monthlyIncome: assessmentInput.monthlyIncome,
      essentialExpenses: assessmentInput.essentialExpenses,
      nonEssentialExpenses: assessmentInput.nonEssentialExpenses,
      debtBalances: assessmentInput.debtBalances,
      monthlyInstallments: assessmentInput.monthlyInstallments,
      savings: assessmentInput.savings,
      financialDependents: assessmentInput.financialDependents,
      emergencyFund: assessmentInput.emergencyFund,
      recentTransactions: recentTx,
    };
  }, [includeProfile, assessments, transactions]);

  const handleSend = async (messageText?: string) => {
    const text = (messageText ?? input).trim();
    if (!text || sending) return;

    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    await sendMessage({
      message: text,
      conversationId: activeConversationId ?? undefined,
      includeProfile,
      profileData: buildProfileData(),
      session,
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewChat = () => {
    startNewConversation();
    setShowSidebar(false);
  };

  const handleSelectConversation = (id: string) => {
    loadMessages(id);
    setShowSidebar(false);
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-5rem)] overflow-hidden">
      {/* Sidebar — conversation history */}
      {showSidebar && (
        <div
          className="fixed inset-0 z-30 bg-navy-950/40 backdrop-blur-sm lg:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      <aside
        className={`${
          showSidebar ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 fixed lg:static z-40 left-0 top-0 bottom-0 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300`}
      >
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={handleNewChat}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Percakapan Baru
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin px-3 py-3 space-y-1">
          <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
            Riwayat Percakapan
          </p>
          {loading && conversations.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 text-gray-300 animate-spin" />
            </div>
          ) : conversations.length === 0 ? (
            <div className="px-3 py-6 text-center">
              <MessageSquare className="w-8 h-8 text-gray-200 mx-auto mb-2" />
              <p className="text-xs text-gray-400">Belum ada percakapan</p>
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv.id)}
                className={`group flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                  activeConversationId === conv.id
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'hover:bg-gray-50 text-gray-600'
                }`}
              >
                <MessageSquare className="w-4 h-4 shrink-0" />
                <span className="text-sm font-medium truncate flex-1">{conv.title}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteConversation(conv.id);
                  }}
                  className="p-1 rounded text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  aria-label="Hapus percakapan"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        {/* Chat header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSidebar(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
              aria-label="Tampilkan riwayat"
            >
              <MessageSquare className="w-5 h-5" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-navy-900">Konsultan AI Finora</h2>
              <p className="text-xs text-gray-400">Edukasi keuangan personal</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto scrollbar-thin px-4 sm:px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <WelcomeScreen
                onSuggestion={(q) => handleSend(q)}
                sending={sending}
              />
            ) : (
              messages.map((msg) => <MessageBubble key={msg.id} message={msg} />)
            )}

            {sending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="card px-4 py-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span className="text-sm text-gray-500">Sedang berpikir...</span>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm text-red-700">{error}</p>
                  <button
                    onClick={() => {
                      clearError();
                      handleSend();
                    }}
                    className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Coba Lagi
                  </button>
                </div>
              </div>
            )}

            {/* AI unavailable notice */}
            {aiUnavailable && (
              <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-sm text-amber-700">
                  Layanan AI belum dikonfigurasi oleh administrator. Anda masih dapat melihat
                  fitur lain di Finora.
                </p>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="px-4 sm:px-6 py-4 bg-white border-t border-gray-200">
          <div className="max-w-3xl mx-auto space-y-3">
            {/* Consent toggle */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={includeProfile}
                  onChange={(e) => setIncludeProfile(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-gray-200 rounded-full peer-checked:bg-emerald-500 transition-colors" />
                <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
              </div>
              <span className="flex items-center gap-1.5 text-xs text-gray-500 group-hover:text-gray-700 transition-colors">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Berikan izin akses data keuangan saya untuk jawaban yang lebih personal
              </span>
            </label>

            {/* Text input */}
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder="Tulis pertanyaan keuangan Anda..."
                rows={1}
                disabled={sending}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 text-sm text-navy-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 resize-none disabled:opacity-60"
                style={{ maxHeight: '120px' }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                aria-label="Kirim pesan"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-gray-400 flex items-start gap-1.5">
              <Info className="w-3 h-3 shrink-0 mt-0.5" />
              Konsultan AI memberikan edukasi keuangan, bukan saran dari penasihat keuangan berizin.
              Tidak ada jaminan imbal hasil investasi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Welcome Screen ────────────────────────────────────────────

function WelcomeScreen({
  onSuggestion,
  sending,
}: {
  onSuggestion: (q: string) => void;
  sending: boolean;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-emerald-200/40 blur-2xl rounded-full" />
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-card-lg">
          <Bot className="w-9 h-9 text-white" strokeWidth={1.8} />
        </div>
      </div>

      <h2 className="text-xl font-bold text-navy-900 mb-2">Konsultan AI Finora</h2>
      <p className="max-w-md text-sm text-gray-500 leading-relaxed mb-8">
        Tanyakan apa saja tentang anggaran, tabungan, utang, atau strategi keuangan.
        Saya siap membantu Anda memahami dan merencanakan keuangan dengan lebih baik.
      </p>

      <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
        {SUGGESTED_QUESTIONS.map((q) => (
          <button
            key={q}
            onClick={() => onSuggestion(q)}
            disabled={sending}
            className="card card-hover p-4 text-left text-sm font-medium text-navy-700 transition-all duration-200 hover:border-emerald-200 hover:bg-emerald-50/50 disabled:opacity-60"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Message Bubble ────────────────────────────────────────────

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
          isUser
            ? 'bg-navy-100 text-navy-600'
            : 'bg-gradient-to-br from-emerald-500 to-emerald-700 text-white'
        }`}
      >
        {isUser ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>
      <div
        className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-navy-900 text-white rounded-tr-sm'
            : 'bg-white border border-gray-100 text-navy-900 rounded-tl-sm shadow-sm'
        }`}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
}
