import {
  Wallet,
  Briefcase,
  TrendingUp,
  Gift,
  ShoppingBag,
  Home,
  Car,
  UtensilsCrossed,
  HeartPulse,
  GraduationCap,
  Plane,
  Dumbbell,
  Smartphone,
  Receipt,
  Film,
  PiggyBank,
  MoreHorizontal,
  type LucideIcon,
} from 'lucide-react';

export type TransactionType = 'income' | 'expense';

export interface CategoryConfig {
  label: string;
  icon: LucideIcon;
  color: string;
}

export const incomeCategories: CategoryConfig[] = [
  { label: 'Gaji', icon: Briefcase, color: '#10b981' },
  { label: 'Bonus', icon: Gift, color: '#34d399' },
  { label: 'Freelance', icon: TrendingUp, color: '#059669' },
  { label: 'Investasi', icon: PiggyBank, color: '#047857' },
  { label: 'Penjualan', icon: ShoppingBag, color: '#6ee7b7' },
  { label: 'Lainnya', icon: Wallet, color: '#9ca3af' },
];

export const expenseCategories: CategoryConfig[] = [
  { label: 'Makanan', icon: UtensilsCrossed, color: '#34d399' },
  { label: 'Belanja', icon: ShoppingBag, color: '#10b981' },
  { label: 'Tagihan', icon: Home, color: '#102a43' },
  { label: 'Transportasi', icon: Car, color: '#627d98' },
  { label: 'Kesehatan', icon: HeartPulse, color: '#059669' },
  { label: 'Pendidikan', icon: GraduationCap, color: '#486581' },
  { label: 'Hiburan', icon: Film, color: '#8b5cf6' },
  { label: 'Olahraga', icon: Dumbbell, color: '#f59e0b' },
  { label: 'Liburan', icon: Plane, color: '#0ea5e9' },
  { label: 'Komunikasi', icon: Smartphone, color: '#334155' },
  { label: 'Cicilan', icon: Receipt, color: '#b91c1c' },
  { label: 'Lainnya', icon: MoreHorizontal, color: '#9ca3af' },
];

export const allCategories = [...incomeCategories, ...expenseCategories];

const categoryMap = new Map<string, CategoryConfig>();
allCategories.forEach((c) => categoryMap.set(c.label, c));

export function getCategoryConfig(label: string): CategoryConfig {
  return (
    categoryMap.get(label) ?? {
      label,
      icon: MoreHorizontal,
      color: '#9ca3af',
    }
  );
}

export function getCategoriesByType(type: TransactionType): CategoryConfig[] {
  return type === 'income' ? incomeCategories : expenseCategories;
}
