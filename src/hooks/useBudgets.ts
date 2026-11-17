import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  month: string;
  limit_amount: number;
  created_at: string;
  updated_at: string;
}

export type BudgetInsert = {
  category: string;
  month: string;
  limit_amount: number;
};

export type BudgetUpdate = Partial<BudgetInsert>;

export function useBudgets(month: string) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    if (!month) return;
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('budgets')
      .select('*')
      .eq('month', month)
      .order('category', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setBudgets((data ?? []) as Budget[]);
    setLoading(false);
  }, [month]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const addBudget = useCallback(
    async (budget: BudgetInsert): Promise<{ error: string | null }> => {
      const { data, error: insertError } = await supabase
        .from('budgets')
        .insert(budget)
        .select()
        .single();

      if (insertError) return { error: insertError.message };

      if (data) {
        setBudgets((prev) => [...prev, data as Budget].sort((a, b) =>
          a.category.localeCompare(b.category)
        ));
      }
      return { error: null };
    },
    []
  );

  const updateBudget = useCallback(
    async (id: string, updates: BudgetUpdate): Promise<{ error: string | null }> => {
      const { data, error: updateError } = await supabase
        .from('budgets')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) return { error: updateError.message };

      if (data) {
        setBudgets((prev) =>
          prev.map((b) => (b.id === id ? (data as Budget) : b))
        );
      }
      return { error: null };
    },
    []
  );

  const deleteBudget = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      const { error: deleteError } = await supabase
        .from('budgets')
        .delete()
        .eq('id', id);

      if (deleteError) return { error: deleteError.message };

      setBudgets((prev) => prev.filter((b) => b.id !== id));
      return { error: null };
    },
    []
  );

  return {
    budgets,
    loading,
    error,
    refetch: fetchBudgets,
    addBudget,
    updateBudget,
    deleteBudget,
  };
}
