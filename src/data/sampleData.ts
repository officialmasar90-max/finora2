import type { LucideIcon } from 'lucide-react';
import {
  ShoppingBag,
  Home,
  Car,
  UtensilsCrossed,
  HeartPulse,
  GraduationCap,
  Plane,
  Dumbbell,
  Smartphone,
  Gift,
  type LucideIcon as _Icon,
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  name: string;
  category: string;
  categoryIcon: LucideIcon;
  categoryColor: string;
  amount: number;
  type: TransactionType;
  date: string;
  monthKey: string;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  color: string;
  icon: LucideIcon;
}

export interface MonthlyData {
  monthKey: string;
  monthLabel: string;
  income: number;
  expense: number;
}

export interface HealthMetric {
  label: string;
  score: number;
  max: number;
  description: string;
  color: string;
}

// ─── Month keys ─────────────────────────────────────────

export const months = [
  { key: '2025-06', label: 'Jun 2025' },
  { key: '2025-07', label: 'Jul 2025' },
  { key: '2025-08', label: 'Agu 2025' },
  { key: '2025-09', label: 'Sep 2025' },
  { key: '2025-10', label: 'Okt 2025' },
  { key: '2025-11', label: 'Nov 2025' },
];

export const defaultMonth = '2025-11';

// ─── Monthly aggregate data (demo) ──────────────────────

export const monthlyData: MonthlyData[] = [
  { monthKey: '2025-06', monthLabel: 'Jun', income: 24_500_000, expense: 14_200_000 },
  { monthKey: '2025-07', monthLabel: 'Jul', income: 26_000_000, expense: 15_800_000 },
  { monthKey: '2025-08', monthLabel: 'Agu', income: 25_500_000, expense: 13_900_000 },
  { monthKey: '2025-09', monthLabel: 'Sep', income: 27_000_000, expense: 16_500_000 },
  { monthKey: '2025-10', monthLabel: 'Okt', income: 28_000_000, expense: 14_800_000 },
  { monthKey: '2025-11', monthLabel: 'Nov', income: 28_500_000, expense: 15_320_000 },
];

// ─── Per-month summary (demo) ───────────────────────────

export interface MonthSummary {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
  prevIncome: number;
  prevExpense: number;
}

export const monthlySummary: Record<string, MonthSummary> = {
  '2025-06': { income: 24_500_000, expense: 14_200_000, balance: 10_300_000, savingsRate: 42, prevIncome: 22_000_000, prevExpense: 13_500_000 },
  '2025-07': { income: 26_000_000, expense: 15_800_000, balance: 10_200_000, savingsRate: 39, prevIncome: 24_500_000, prevExpense: 14_200_000 },
  '2025-08': { income: 25_500_000, expense: 13_900_000, balance: 11_600_000, savingsRate: 45, prevIncome: 26_000_000, prevExpense: 15_800_000 },
  '2025-09': { income: 27_000_000, expense: 16_500_000, balance: 10_500_000, savingsRate: 39, prevIncome: 25_500_000, prevExpense: 13_900_000 },
  '2025-10': { income: 28_000_000, expense: 14_800_000, balance: 13_200_000, savingsRate: 47, prevIncome: 27_000_000, prevExpense: 16_500_000 },
  '2025-11': { income: 28_500_000, expense: 15_320_000, balance: 13_180_000, savingsRate: 46, prevIncome: 28_000_000, prevExpense: 14_800_000 },
};

// ─── Category breakdown per month (demo) ────────────────

export const categoryBreakdown: Record<string, CategoryBreakdown[]> = {
  '2025-06': [
    { category: 'Kebutuhan', amount: 4_200_000, color: '#10b981', icon: ShoppingBag },
    { category: 'Tagihan', amount: 3_500_000, color: '#102a43', icon: Home },
    { category: 'Transportasi', amount: 2_100_000, color: '#627d98', icon: Car },
    { category: 'Makanan', amount: 2_800_000, color: '#34d399', icon: UtensilsCrossed },
    { category: 'Lainnya', amount: 1_600_000, color: '#9ca3af', icon: Gift },
  ],
  '2025-07': [
    { category: 'Kebutuhan', amount: 4_800_000, color: '#10b981', icon: ShoppingBag },
    { category: 'Tagihan', amount: 3_200_000, color: '#102a43', icon: Home },
    { category: 'Transportasi', amount: 2_400_000, color: '#627d98', icon: Car },
    { category: 'Makanan', amount: 3_200_000, color: '#34d399', icon: UtensilsCrossed },
    { category: 'Lainnya', amount: 2_200_000, color: '#9ca3af', icon: Gift },
  ],
  '2025-08': [
    { category: 'Kebutuhan', amount: 3_900_000, color: '#10b981', icon: ShoppingBag },
    { category: 'Tagihan', amount: 3_000_000, color: '#102a43', icon: Home },
    { category: 'Transportasi', amount: 1_800_000, color: '#627d98', icon: Car },
    { category: 'Makanan', amount: 2_600_000, color: '#34d399', icon: UtensilsCrossed },
    { category: 'Lainnya', amount: 2_600_000, color: '#9ca3af', icon: Gift },
  ],
  '2025-09': [
    { category: 'Kebutuhan', amount: 5_000_000, color: '#10b981', icon: ShoppingBag },
    { category: 'Tagihan', amount: 3_800_000, color: '#102a43', icon: Home },
    { category: 'Transportasi', amount: 2_600_000, color: '#627d98', icon: Car },
    { category: 'Makanan', amount: 3_100_000, color: '#34d399', icon: UtensilsCrossed },
    { category: 'Lainnya', amount: 2_000_000, color: '#9ca3af', icon: Gift },
  ],
  '2025-10': [
    { category: 'Kebutuhan', amount: 4_100_000, color: '#10b981', icon: ShoppingBag },
    { category: 'Tagihan', amount: 3_300_000, color: '#102a43', icon: Home },
    { category: 'Transportasi', amount: 2_000_000, color: '#627d98', icon: Car },
    { category: 'Makanan', amount: 2_900_000, color: '#34d399', icon: UtensilsCrossed },
    { category: 'Lainnya', amount: 2_500_000, color: '#9ca3af', icon: Gift },
  ],
  '2025-11': [
    { category: 'Kebutuhan', amount: 4_500_000, color: '#10b981', icon: ShoppingBag },
    { category: 'Tagihan', amount: 3_400_000, color: '#102a43', icon: Home },
    { category: 'Transportasi', amount: 2_200_000, color: '#627d98', icon: Car },
    { category: 'Makanan', amount: 3_000_000, color: '#34d399', icon: UtensilsCrossed },
    { category: 'Lainnya', amount: 2_220_000, color: '#9ca3af', icon: Gift },
  ],
};

// ─── Transactions per month (demo) ──────────────────────

export const transactions: Transaction[] = [
  // Nov 2025
  { id: 't1', name: 'Gaji Bulanan', category: 'Pemasukan', categoryIcon: Gift, categoryColor: '#10b981', amount: 25_000_000, type: 'income', date: '2025-11-25', monthKey: '2025-11' },
  { id: 't2', name: 'Bonus Proyek', category: 'Pemasukan', categoryIcon: Gift, categoryColor: '#10b981', amount: 3_500_000, type: 'income', date: '2025-11-20', monthKey: '2025-11' },
  { id: 't3', name: 'Belanja Groceries', category: 'Kebutuhan', categoryIcon: ShoppingBag, categoryColor: '#10b981', amount: 850_000, type: 'expense', date: '2025-11-22', monthKey: '2025-11' },
  { id: 't4', name: 'Cicilan Rumah', category: 'Tagihan', categoryIcon: Home, categoryColor: '#102a43', amount: 2_500_000, type: 'expense', date: '2025-11-10', monthKey: '2025-11' },
  { id: 't5', name: 'Bensin Mobil', category: 'Transportasi', categoryIcon: Car, categoryColor: '#627d98', amount: 500_000, type: 'expense', date: '2025-11-15', monthKey: '2025-11' },
  { id: 't6', name: 'Makan di Restoran', category: 'Makanan', categoryIcon: UtensilsCrossed, categoryColor: '#34d399', amount: 350_000, type: 'expense', date: '2025-11-18', monthKey: '2025-11' },
  { id: 't7', name: 'Paket Internet', category: 'Tagihan', categoryIcon: Smartphone, categoryColor: '#102a43', amount: 350_000, type: 'expense', date: '2025-11-08', monthKey: '2025-11' },
  { id: 't8', name: 'Belanja Online', category: 'Kebutuhan', categoryIcon: ShoppingBag, categoryColor: '#10b981', amount: 720_000, type: 'expense', date: '2025-11-12', monthKey: '2025-11' },

  // Oct 2025
  { id: 't9', name: 'Gaji Bulanan', category: 'Pemasukan', categoryIcon: Gift, categoryColor: '#10b981', amount: 25_000_000, type: 'income', date: '2025-10-25', monthKey: '2025-10' },
  { id: 't10', name: 'Freelance Design', category: 'Pemasukan', categoryIcon: Gift, categoryColor: '#10b981', amount: 3_000_000, type: 'income', date: '2025-10-18', monthKey: '2025-10' },
  { id: 't11', name: 'Belanja Groceries', category: 'Kebutuhan', categoryIcon: ShoppingBag, categoryColor: '#10b981', amount: 920_000, type: 'expense', date: '2025-10-20', monthKey: '2025-10' },
  { id: 't12', name: 'Cicilan Rumah', category: 'Tagihan', categoryIcon: Home, categoryColor: '#102a43', amount: 2_500_000, type: 'expense', date: '2025-10-10', monthKey: '2025-10' },
  { id: 't13', name: 'Tiket Bioskop', category: 'Lainnya', categoryIcon: Gift, categoryColor: '#9ca3af', amount: 250_000, type: 'expense', date: '2025-10-14', monthKey: '2025-10' },

  // Sep 2025
  { id: 't14', name: 'Gaji Bulanan', category: 'Pemasukan', categoryIcon: Gift, categoryColor: '#10b981', amount: 25_000_000, type: 'income', date: '2025-09-25', monthKey: '2025-09' },
  { id: 't15', name: 'Belanja Sekolah', category: 'Pendidikan', categoryIcon: GraduationCap, categoryColor: '#486581', amount: 1_200_000, type: 'expense', date: '2025-09-03', monthKey: '2025-09' },
  { id: 't16', name: 'Vitamin & Obat', category: 'Kesehatan', categoryIcon: HeartPulse, categoryColor: '#059669', amount: 450_000, type: 'expense', date: '2025-09-12', monthKey: '2025-09' },

  // Aug 2025
  { id: 't17', name: 'Gaji Bulanan', category: 'Pemasukan', categoryIcon: Gift, categoryColor: '#10b981', amount: 25_000_000, type: 'income', date: '2025-08-25', monthKey: '2025-08' },
  { id: 't18', name: 'Liburan Keluarga', category: 'Lainnya', categoryIcon: Plane, categoryColor: '#9ca3af', amount: 3_500_000, type: 'expense', date: '2025-08-17', monthKey: '2025-08' },
  { id: 't19', name: 'Membership Gym', category: 'Lainnya', categoryIcon: Dumbbell, categoryColor: '#9ca3af', amount: 350_000, type: 'expense', date: '2025-08-05', monthKey: '2025-08' },

  // Jul 2025
  { id: 't20', name: 'Gaji Bulanan', category: 'Pemasukan', categoryIcon: Gift, categoryColor: '#10b981', amount: 25_000_000, type: 'income', date: '2025-07-25', monthKey: '2025-07' },
  { id: 't21', name: 'Belanja Groceries', category: 'Kebutuhan', categoryIcon: ShoppingBag, categoryColor: '#10b981', amount: 1_100_000, type: 'expense', date: '2025-07-20', monthKey: '2025-07' },

  // Jun 2025
  { id: 't22', name: 'Gaji Bulanan', category: 'Pemasukan', categoryIcon: Gift, categoryColor: '#10b981', amount: 24_500_000, type: 'income', date: '2025-06-25', monthKey: '2025-06' },
  { id: 't23', name: 'Cicilan Rumah', category: 'Tagihan', categoryIcon: Home, categoryColor: '#102a43', amount: 2_500_000, type: 'expense', date: '2025-06-10', monthKey: '2025-06' },
];

// ─── Financial health metrics (demo) ────────────────────

export const healthMetrics: Record<string, HealthMetric[]> = {
  '2025-06': [
    { label: 'Rasio Tabungan', score: 42, max: 100, description: 'Anda menabung 42% dari pemasukan', color: '#10b981' },
    { label: 'Rasio Utang', score: 28, max: 100, description: 'Rasio utang terhadap pendapatan', color: '#102a43' },
    { label: 'Dana Darurat', score: 55, max: 100, description: 'Cakupan 3,3 bulan pengeluaran', color: '#34d399' },
    { label: 'Stabilitas', score: 70, max: 100, description: 'Konsistensi pemasukan bulanan', color: '#486581' },
  ],
  '2025-07': [
    { label: 'Rasio Tabungan', score: 39, max: 100, description: 'Anda menabung 39% dari pemasukan', color: '#10b981' },
    { label: 'Rasio Utang', score: 30, max: 100, description: 'Rasio utang terhadap pendapatan', color: '#102a43' },
    { label: 'Dana Darurat', score: 58, max: 100, description: 'Cakupan 3,5 bulan pengeluaran', color: '#34d399' },
    { label: 'Stabilitas', score: 72, max: 100, description: 'Konsistensi pemasukan bulanan', color: '#486581' },
  ],
  '2025-08': [
    { label: 'Rasio Tabungan', score: 45, max: 100, description: 'Anda menabung 45% dari pemasukan', color: '#10b981' },
    { label: 'Rasio Utang', score: 26, max: 100, description: 'Rasio utang terhadap pendapatan', color: '#102a43' },
    { label: 'Dana Darurat', score: 62, max: 100, description: 'Cakupan 4 bulan pengeluaran', color: '#34d399' },
    { label: 'Stabilitas', score: 68, max: 100, description: 'Konsistensi pemasukan bulanan', color: '#486581' },
  ],
  '2025-09': [
    { label: 'Rasio Tabungan', score: 39, max: 100, description: 'Anda menabung 39% dari pemasukan', color: '#10b981' },
    { label: 'Rasio Utang', score: 32, max: 100, description: 'Rasio utang terhadap pendapatan', color: '#102a43' },
    { label: 'Dana Darurat', score: 60, max: 100, description: 'Cakupan 3,6 bulan pengeluaran', color: '#34d399' },
    { label: 'Stabilitas', score: 75, max: 100, description: 'Konsistensi pemasukan bulanan', color: '#486581' },
  ],
  '2025-10': [
    { label: 'Rasio Tabungan', score: 47, max: 100, description: 'Anda menabung 47% dari pemasukan', color: '#10b981' },
    { label: 'Rasio Utang', score: 25, max: 100, description: 'Rasio utang terhadap pendapatan', color: '#102a43' },
    { label: 'Dana Darurat', score: 68, max: 100, description: 'Cakupan 4,5 bulan pengeluaran', color: '#34d399' },
    { label: 'Stabilitas', score: 78, max: 100, description: 'Konsistensi pemasukan bulanan', color: '#486581' },
  ],
  '2025-11': [
    { label: 'Rasio Tabungan', score: 46, max: 100, description: 'Anda menabung 46% dari pemasukan', color: '#10b981' },
    { label: 'Rasio Utang', score: 24, max: 100, description: 'Rasio utang terhadap pendapatan', color: '#102a43' },
    { label: 'Dana Darurat', score: 72, max: 100, description: 'Cakupan 5 bulan pengeluaran', color: '#34d399' },
    { label: 'Stabilitas', score: 80, max: 100, description: 'Konsistensi pemasukan bulanan', color: '#486581' },
  ],
};

export function getOverallHealthScore(monthKey: string): number {
  const metrics = healthMetrics[monthKey];
  if (!metrics || metrics.length === 0) return 0;
  const total = metrics.reduce((sum, m) => sum + m.score, 0);
  return Math.round(total / metrics.length);
}
