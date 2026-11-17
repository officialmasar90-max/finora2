import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type {
  Transaction,
  TransactionInsert,
  TransactionUpdate,
  TransactionFilters,
} from '@/types/transaction';
import { getMonthKey } from '@/types/transaction';

export interface MonthlySummary {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
}

export interface CategoryBreakdownItem {
  category: string;
  amount: number;
  color: string;
}

export interface MonthlyChartData {
  monthKey: string;
  monthLabel: string;
  income: number;
  expense: number;
}

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);

    const { data, error: fetchError } = await supabase
      .from('transactions')
      .select('*')
      .order('transaction_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setTransactions((data ?? []) as Transaction[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = useCallback(
    async (tx: TransactionInsert): Promise<{ error: string | null }> => {
      const { data, error: insertError } = await supabase
        .from('transactions')
        .insert(tx)
        .select()
        .single();

      if (insertError) return { error: insertError.message };

      if (data) {
        setTransactions((prev) => [data as Transaction, ...prev]);
      }
      return { error: null };
    },
    []
  );

  const updateTransaction = useCallback(
    async (id: string, updates: TransactionUpdate): Promise<{ error: string | null }> => {
      const { data, error: updateError } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (updateError) return { error: updateError.message };

      if (data) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? (data as Transaction) : t))
        );
      }
      return { error: null };
    },
    []
  );

  const deleteTransaction = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      const { error: deleteError } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (deleteError) return { error: deleteError.message };

      setTransactions((prev) => prev.filter((t) => t.id !== id));
      return { error: null };
    },
    []
  );

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  };
}

// ─── Derived data helpers ────────────────────────────────────

export function filterTransactions(
  transactions: Transaction[],
  filters: TransactionFilters
): Transaction[] {
  return transactions.filter((tx) => {
    if (filters.type !== 'all' && tx.type !== filters.type) return false;
    if (filters.category !== 'all' && tx.category !== filters.category) return false;
    if (filters.startDate && tx.transaction_date < filters.startDate) return false;
    if (filters.endDate && tx.transaction_date > filters.endDate) return false;
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      const haystack = `${tx.description} ${tx.category}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

export function getMonthlySummary(
  transactions: Transaction[],
  monthKey: string
): MonthlySummary {
  const monthTxs = transactions.filter(
    (t) => getMonthKey(t.transaction_date) === monthKey
  );

  const income = monthTxs
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expense = monthTxs
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const balance = income - expense;
  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

  return { income, expense, balance, savingsRate };
}

export function getCategoryBreakdown(
  transactions: Transaction[],
  monthKey: string,
  categoryColors: Record<string, string>
): CategoryBreakdownItem[] {
  const monthExpenses = transactions.filter(
    (t) =>
      getMonthKey(t.transaction_date) === monthKey && t.type === 'expense'
  );

  const byCategory = new Map<string, number>();
  for (const tx of monthExpenses) {
    byCategory.set(
      tx.category,
      (byCategory.get(tx.category) ?? 0) + Number(tx.amount)
    );
  }

  return Array.from(byCategory.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      color: categoryColors[category] ?? '#9ca3af',
    }))
    .sort((a, b) => b.amount - a.amount);
}

export function getMonthlyChartData(
  transactions: Transaction[],
  numMonths = 6
): MonthlyChartData[] {
  const now = new Date();
  const months: MonthlyChartData[] = [];

  for (let i = numMonths - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = getMonthKey(d);
    const summary = getMonthlySummary(transactions, monthKey);
    const monthLabel = new Intl.DateTimeFormat('id-ID', {
      month: 'short',
    }).format(d);

    months.push({
      monthKey,
      monthLabel,
      income: summary.income,
      expense: summary.expense,
    });
  }

  return months;
}

export function getAvailableMonths(transactions: Transaction[]): { key: string; label: string }[] {
  const now = new Date();
  const set = new Set<string>();

  // Include current + previous 11 months so the filter always has options
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    set.add(getMonthKey(d));
  }

  // Include any month that has transactions
  for (const tx of transactions) {
    set.add(getMonthKey(tx.transaction_date));
  }

  return Array.from(set)
    .sort((a, b) => b.localeCompare(a))
    .map((key) => {
      const [year, month] = key.split('-');
      const d = new Date(Number(year), Number(month) - 1, 1);
      return {
        key,
        label: new Intl.DateTimeFormat('id-ID', {
          month: 'short',
          year: 'numeric',
        }).format(d),
      };
    });
}
