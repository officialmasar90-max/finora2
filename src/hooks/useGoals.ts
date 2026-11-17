import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  category: string;
  target_amount: number;
  current_savings: number;
  deadline: string;
  is_achieved: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type GoalInsert = {
  name: string;
  category: string;
  target_amount: number;
  current_savings: number;
  deadline: string;
  notes?: string | null;
};

export type GoalUpdate = Partial<GoalInsert> & {
  is_achieved?: boolean;
};

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('goals')
      .select('*')
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setGoals((data ?? []) as Goal[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = useCallback(
    async (goal: GoalInsert): Promise<{ error: string | null }> => {
      const { data, error: insertError } = await supabase
        .from('goals')
        .insert(goal)
        .select()
        .single();

      if (insertError) return { error: insertError.message };

      if (data) {
        setGoals((prev) => [data as Goal, ...prev]);
      }
      return { error: null };
    },
    []
  );

  const updateGoal = useCallback(
    async (id: string, updates: GoalUpdate): Promise<{ error: string | null }> => {
      const { data, error: updateError } = await supabase
        .from('goals')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) return { error: updateError.message };

      if (data) {
        setGoals((prev) => prev.map((g) => (g.id === id ? (data as Goal) : g)));
      }
      return { error: null };
    },
    []
  );

  const deleteGoal = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      const { error: deleteError } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);

      if (deleteError) return { error: deleteError.message };

      setGoals((prev) => prev.filter((g) => g.id !== id));
      return { error: null };
    },
    []
  );

  return {
    goals,
    loading,
    error,
    refetch: fetchGoals,
    addGoal,
    updateGoal,
    deleteGoal,
  };
}
