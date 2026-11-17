// ─── Financial Report Aggregation Engine ───────────────────────
//
// Aggregates real user data (transactions, budgets, debts, goals) into a
// structured report for a given period. Every number is derived from actual
// Supabase records — no demo data is ever mixed in. When a data source is
// empty, the report explicitly marks it as such rather than fabricating values.
//
// All monetary values are in Indonesian Rupiah (IDR).

import type { Transaction } from '@/types/transaction';
import { getMonthKey } from '@/types/transaction';
import type { Budget } from '@/hooks/useBudgets';
import type { Debt } from '@/hooks/useDebts';
import type { Goal } from '@/hooks/useGoals';
import { getCategoryConfig } from '@/config/categories';
import { formatIDR } from '@/utils/format';

export type ReportPeriodType = 'monthly' | 'yearly';

export interface ReportPeriod {
  type: ReportPeriodType;
  key: string; // "2026-11" for monthly, "2026" for yearly
  label: string; // "November 2026" / "Tahun 2026"
  startDate: string; // ISO yyyy-mm-dd inclusive
  endDate: string; // ISO yyyy-mm-dd inclusive
}

export interface CategoryExpense {
  category: string;
  amount: number;
  color: string;
  percentage: number;
}

export interface BudgetPerformance {
  category: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger' | 'no-spending';
}

export interface ReportData {
  period: ReportPeriod;
  income: number;
  expenses: number;
  cashFlow: number;
  savingsRate: number; // percentage
  transactionCount: number;
  topExpenses: CategoryExpense[];
  budgetPerformance: BudgetPerformance[];
  debtSnapshot: {
    activeCount: number;
    totalPrincipal: number;
    monthlyInstallments: number;
  };
  goalsSnapshot: {
    totalCount: number;
    achievedCount: number;
    totalTarget: number;
    totalSaved: number;
    overallProgress: number;
  };
  hasTransactionData: boolean;
}

export function getPeriodForKey(type: ReportPeriodType, key: string): ReportPeriod {
  if (type === 'yearly') {
    const year = Number(key);
    return {
      type,
      key,
      label: `Tahun ${year}`,
      startDate: `${year}-01-01`,
      endDate: `${year}-12-31`,
    };
  }
  const [yearStr, monthStr] = key.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const lastDay = new Date(year, month, 0).getDate();
  const label = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(
    new Date(year, month - 1, 1)
  );
  return {
    type,
    key,
    label,
    startDate: `${key}-01`,
    endDate: `${key}-${String(lastDay).padStart(2, '0')}`,
  };
}

export function getAvailableReportPeriods(
  transactions: Transaction[],
  type: ReportPeriodType
): { key: string; label: string }[] {
  const now = new Date();
  const set = new Set<string>();

  if (type === 'monthly') {
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      set.add(getMonthKey(d));
    }
  } else {
    for (let i = 0; i < 3; i++) {
      set.add(String(now.getFullYear() - i));
    }
  }

  for (const tx of transactions) {
    const d = new Date(tx.transaction_date);
    set.add(type === 'monthly' ? getMonthKey(tx.transaction_date) : String(d.getFullYear()));
  }

  return Array.from(set)
    .sort((a, b) => b.localeCompare(a))
    .map((key) => {
      if (type === 'yearly') {
        return { key, label: `Tahun ${key}` };
      }
      const [y, m] = key.split('-');
      return {
        key,
        label: new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(
          new Date(Number(y), Number(m) - 1, 1)
        ),
      };
    });
}

function inPeriod(dateStr: string, period: ReportPeriod): boolean {
  return dateStr >= period.startDate && dateStr <= period.endDate;
}

export function generateReportData(
  transactions: Transaction[],
  budgets: Budget[],
  debts: Debt[],
  goals: Goal[],
  period: ReportPeriod
): ReportData {
  const periodTxs = transactions.filter((t) => inPeriod(t.transaction_date, period));

  const income = periodTxs
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);
  const expenses = periodTxs
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);
  const cashFlow = income - expenses;
  const savingsRate = income > 0 ? Math.round((cashFlow / income) * 100) : 0;

  // Category breakdown
  const byCategory = new Map<string, number>();
  for (const tx of periodTxs) {
    if (tx.type !== 'expense') continue;
    byCategory.set(tx.category, (byCategory.get(tx.category) ?? 0) + Number(tx.amount));
  }
  const topExpenses: CategoryExpense[] = Array.from(byCategory.entries())
    .map(([category, amount]) => ({
      category,
      amount,
      color: getCategoryConfig(category).color,
      percentage: expenses > 0 ? Math.round((amount / expenses) * 100) : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  // Budget performance for the period (monthly periods only have meaningful budgets)
  const budgetPerformance: BudgetPerformance[] = budgets
    .filter((b) => period.type === 'monthly' ? b.month === period.key : true)
    .map((b) => {
      const limit = Number(b.limit_amount);
      const spent = byCategory.get(b.category) ?? 0;
      const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      let status: BudgetPerformance['status'];
      if (spent === 0) status = 'no-spending';
      else if (percentage >= 100) status = 'danger';
      else if (percentage >= 80) status = 'warning';
      else status = 'safe';
      return {
        category: b.category,
        limit,
        spent,
        remaining: limit - spent,
        percentage,
        status,
      };
    })
    .sort((a, b) => b.percentage - a.percentage);

  // Debt snapshot (current state — debts are not period-scoped)
  const activeDebts = debts.filter((d) => !d.is_paid_off);
  const debtSnapshot = {
    activeCount: activeDebts.length,
    totalPrincipal: activeDebts.reduce((s, d) => s + Number(d.principal), 0),
    monthlyInstallments: activeDebts.reduce((s, d) => s + Number(d.monthly_installment), 0),
  };

  // Goals snapshot (current state)
  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
  const totalSaved = goals.reduce((s, g) => s + Number(g.current_savings), 0);
  const goalsSnapshot = {
    totalCount: goals.length,
    achievedCount: goals.filter((g) => g.is_achieved || Number(g.current_savings) >= Number(g.target_amount)).length,
    totalTarget,
    totalSaved,
    overallProgress: totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0,
  };

  return {
    period,
    income,
    expenses,
    cashFlow,
    savingsRate,
    transactionCount: periodTxs.length,
    topExpenses,
    budgetPerformance,
    debtSnapshot,
    goalsSnapshot,
    hasTransactionData: periodTxs.length > 0,
  };
}

export function formatReportSummaryText(data: ReportData): string {
  const lines: string[] = [];
  lines.push(`Laporan Keuangan Finora — ${data.period.label}`);
  lines.push(`Periode: ${data.period.startDate} s/d ${data.period.endDate}`);
  lines.push('');
  lines.push(`Pendapatan: ${formatIDR(data.income)}`);
  lines.push(`Pengeluaran: ${formatIDR(data.expenses)}`);
  lines.push(`Arus Kas Bersih: ${formatIDR(data.cashFlow)}`);
  lines.push(`Rasio Tabungan: ${data.savingsRate}%`);
  lines.push(`Jumlah Transaksi: ${data.transactionCount}`);
  lines.push('');
  lines.push('Pengeluaran per Kategori:');
  if (data.topExpenses.length === 0) {
    lines.push('  (tidak ada data pengeluaran pada periode ini)');
  } else {
    for (const e of data.topExpenses) {
      lines.push(`  - ${e.category}: ${formatIDR(e.amount)} (${e.percentage}%)`);
    }
  }
  lines.push('');
  if (data.budgetPerformance.length > 0) {
    lines.push('Kinerja Anggaran:');
    for (const b of data.budgetPerformance) {
      const pct = b.status === 'no-spending' ? 'belum ada pengeluaran' : `${b.percentage}% terpakai`;
      lines.push(`  - ${b.category}: ${formatIDR(b.spent)} / ${formatIDR(b.limit)} (${pct})`);
    }
    lines.push('');
  }
  lines.push('Kondisi Utang (saat ini):');
  lines.push(`  - Utang aktif: ${data.debtSnapshot.activeCount}`);
  lines.push(`  - Total pokok: ${formatIDR(data.debtSnapshot.totalPrincipal)}`);
  lines.push(`  - Cicilan bulanan: ${formatIDR(data.debtSnapshot.monthlyInstallments)}`);
  lines.push('');
  lines.push('Kondisi Tujuan Keuangan (saat ini):');
  lines.push(`  - Tujuan tercapai: ${data.goalsSnapshot.achievedCount} dari ${data.goalsSnapshot.totalCount}`);
  lines.push(`  - Total tersimpan: ${formatIDR(data.goalsSnapshot.totalSaved)} dari ${formatIDR(data.goalsSnapshot.totalTarget)} (${data.goalsSnapshot.overallProgress}%)`);
  return lines.join('\n');
}
