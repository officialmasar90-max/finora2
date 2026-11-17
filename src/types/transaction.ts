import type { TransactionType } from '@/config/categories';

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: TransactionType;
  category: string;
  description: string;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

export type TransactionInsert = Omit<
  Transaction,
  'id' | 'user_id' | 'created_at' | 'updated_at'
>;

export type TransactionUpdate = Partial<TransactionInsert>;

export interface TransactionFilters {
  search: string;
  type: TransactionType | 'all';
  category: string | 'all';
  startDate: string | '';
  endDate: string | '';
}

export const emptyFilters: TransactionFilters = {
  search: '',
  type: 'all',
  category: 'all',
  startDate: '',
  endDate: '',
};

export interface HealthMetric {
  label: string;
  score: number;
  max: number;
  description: string;
  color: string;
}

export function getMonthKey(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const d = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat('id-ID', {
    month: 'short',
    year: 'numeric',
  }).format(d);
}
