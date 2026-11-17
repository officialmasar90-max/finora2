import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  principal: number;
  interest_rate: number;
  monthly_installment: number;
  minimum_payment: number;
  due_date: string;
  is_paid_off: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type DebtInsert = {
  name: string;
  principal: number;
  interest_rate: number;
  monthly_installment: number;
  minimum_payment: number;
  due_date: string;
  notes?: string | null;
};

export type DebtUpdate = Partial<DebtInsert> & {
  is_paid_off?: boolean;
};

export function useDebts() {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDebts = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('debts')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setDebts((data ?? []) as Debt[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  const addDebt = useCallback(
    async (debt: DebtInsert): Promise<{ error: string | null }> => {
      const { data, error: insertError } = await supabase
        .from('debts')
        .insert(debt)
        .select()
        .single();

      if (insertError) return { error: insertError.message };

      if (data) {
        setDebts((prev) => [data as Debt, ...prev]);
      }
      return { error: null };
    },
    []
  );

  const updateDebt = useCallback(
    async (id: string, updates: DebtUpdate): Promise<{ error: string | null }> => {
      const { data, error: updateError } = await supabase
        .from('debts')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) return { error: updateError.message };

      if (data) {
        setDebts((prev) => prev.map((d) => (d.id === id ? (data as Debt) : d)));
      }
      return { error: null };
    },
    []
  );

  const deleteDebt = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      const { error: deleteError } = await supabase
        .from('debts')
        .delete()
        .eq('id', id);

      if (deleteError) return { error: deleteError.message };

      setDebts((prev) => prev.filter((d) => d.id !== id));
      return { error: null };
    },
    []
  );

  return {
    debts,
    loading,
    error,
    refetch: fetchDebts,
    addDebt,
    updateDebt,
    deleteDebt,
  };
}
