import { useState, useMemo } from 'react';
import { TrendingUp, TrendingDown, Wallet, PiggyBank, Loader2, AlertCircle, Inbox, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '@/components/dashboard/StatCard';
import SectionCard from '@/components/dashboard/SectionCard';
import EmptyState from '@/components/dashboard/EmptyState';
import MonthFilter from '@/components/dashboard/MonthFilter';
import IncomeExpenseChart from '@/components/dashboard/IncomeExpenseChart';
import CategoryBreakdownChart from '@/components/dashboard/CategoryBreakdownChart';
import RecentTransactions from '@/components/dashboard/RecentTransactions';
import FinancialHealth from '@/components/dashboard/FinancialHealth';
import { useTransactions, getMonthlySummary, getCategoryBreakdown, getMonthlyChartData, getAvailableMonths } from '@/hooks/useTransactions';
import { getMonthKey, type HealthMetric } from '@/types/transaction';
import { getCategoryConfig } from '@/config/categories';
import { formatIDR } from '@/utils/format';

function computeHealthMetrics(
  income: number,
  expense: number,
  balance: number,
  prevMonthsData: { income: number; expense: number }[]
): HealthMetric[] {
  if (income === 0 && expense === 0) return [];

  const savingsRate = income > 0 ? Math.round((balance / income) * 100) : 0;

  // Expense ratio: how much of income is spent (lower is better)
  const expenseRatio = income > 0 ? Math.round((expense / income) * 100) : 100;
  const debtScore = Math.max(0, 100 - expenseRatio);

  // Stability: consistency of income across previous months
  const prevIncomes = prevMonthsData.map((m) => m.income).filter((v) => v > 0);
  let stabilityScore = 50;
  if (prevIncomes.length >= 2) {
    const avg = prevIncomes.reduce((s, v) => s + v, 0) / prevIncomes.length;
    const variance = prevIncomes.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / prevIncomes.length;
    const cv = avg > 0 ? Math.sqrt(variance) / avg : 1;
    stabilityScore = Math.round(Math.max(0, Math.min(100, 100 - cv * 100)));
  } else if (prevIncomes.length === 1) {
    stabilityScore = 65;
  }

  // Emergency fund: balance relative to monthly expense (3-6 months is ideal)
  const monthsCovered = expense > 0 ? balance / expense : 0;
  const emergencyScore = Math.min(100, Math.round((monthsCovered / 6) * 100));

  return [
    {
      label: 'Rasio Tabungan',
      score: Math.max(0, Math.min(100, savingsRate)),
      max: 100,
      description: `Anda menabung ${savingsRate}% dari pemasukan`,
      color: '#10b981',
    },
    {
      label: 'Rasio Pengeluaran',
      score: debtScore,
      max: 100,
      description: `${expenseRatio}% pemasukan terpakai untuk pengeluaran`,
      color: '#102a43',
    },
    {
      label: 'Dana Darurat',
      score: Math.max(0, Math.min(100, emergencyScore)),
      max: 100,
      description: expense > 0 ? `Cakupan ${monthsCovered.toFixed(1)} bulan pengeluaran` : 'Belum ada data pengeluaran',
      color: '#34d399',
    },
    {
      label: 'Stabilitas',
      score: stabilityScore,
      max: 100,
      description: 'Konsistensi pemasukan bulanan',
      color: '#486581',
    },
  ];
}

export default function DashboardPage() {
  const { transactions, loading, error } = useTransactions();
  const availableMonths = useMemo(() => getAvailableMonths(transactions), [transactions]);
  const [selectedMonth, setSelectedMonth] = useState(
    availableMonths[0]?.key ?? getMonthKey(new Date())
  );

  // Make sure selectedMonth is valid once months load
  const effectiveMonth = availableMonths.find((m) => m.key === selectedMonth)
    ? selectedMonth
    : availableMonths[0]?.key ?? getMonthKey(new Date());

  const summary = useMemo(
    () => getMonthlySummary(transactions, effectiveMonth),
    [transactions, effectiveMonth]
  );

  const categoryColors = useMemo(() => {
    const map: Record<string, string> = {};
    for (const tx of transactions) {
      if (!map[tx.category]) {
        map[tx.category] = getCategoryConfig(tx.category).color;
      }
    }
    return map;
  }, [transactions]);

  const categories = useMemo(
    () => getCategoryBreakdown(transactions, effectiveMonth, categoryColors),
    [transactions, effectiveMonth, categoryColors]
  );

  const monthTransactions = useMemo(
    () =>
      transactions
        .filter((t) => getMonthKey(t.transaction_date) === effectiveMonth)
        .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime()),
    [transactions, effectiveMonth]
  );

  const monthlyChart = useMemo(() => getMonthlyChartData(transactions, 6), [transactions]);

  // Previous month data for comparison
  const prevMonthKey = useMemo(() => {
    const [year, month] = effectiveMonth.split('-');
    const d = new Date(Number(year), Number(month) - 2, 1);
    return getMonthKey(d);
  }, [effectiveMonth]);

  const prevSummary = useMemo(
    () => getMonthlySummary(transactions, prevMonthKey),
    [transactions, prevMonthKey]
  );

  const incomeChange = prevSummary.income > 0
    ? Math.round(((summary.income - prevSummary.income) / prevSummary.income) * 100)
    : 0;
  const expenseChange = prevSummary.expense > 0
    ? Math.round(((summary.expense - prevSummary.expense) / prevSummary.expense) * 100)
    : 0;

  const prevMonthsForStability = useMemo(() => {
    // Get up to 5 months before the selected month for stability calc
    const [year, month] = effectiveMonth.split('-').map(Number);
    const result: { income: number; expense: number }[] = [];
    for (let i = 1; i <= 5; i++) {
      const d = new Date(year, month - 1 - i, 1);
      const mk = getMonthKey(d);
      const s = getMonthlySummary(transactions, mk);
      result.push({ income: s.income, expense: s.expense });
    }
    return result;
  }, [transactions, effectiveMonth]);

  const healthMetrics = useMemo(
    () =>
      computeHealthMetrics(
        summary.income,
        summary.expense,
        summary.balance,
        prevMonthsForStability
      ),
    [summary, prevMonthsForStability]
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-navy-900">Gagal memuat data</p>
        <p className="mt-1 text-sm text-gray-500 max-w-xs">{error}</p>
      </div>
    );
  }

  const hasData = transactions.length > 0;

  return (
    <div className="space-y-6">
      {/* Header with month filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Dasbor Keuangan</h2>
          <p className="text-sm text-gray-500 mt-1">
            Ringkasan kondisi keuangan Anda secara menyeluruh
          </p>
        </div>
        <MonthFilter
          months={availableMonths}
          value={effectiveMonth}
          onChange={setSelectedMonth}
        />
      </div>

      {/* Empty state CTA when no transactions at all */}
      {!hasData && (
        <div className="card p-8">
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-navy-900">Belum ada transaksi</p>
            <p className="mt-1 text-sm text-gray-500 max-w-xs">
              Mulai kelola keuangan Anda dengan menambahkan transaksi pertama.
            </p>
            <Link to="/transactions" className="btn-primary mt-5">
              <Plus className="w-4 h-4" />
              Tambah Transaksi
            </Link>
          </div>
        </div>
      )}

      {/* Stat cards */}
      {hasData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label="Total Pemasukan"
            value={summary.income}
            change={incomeChange}
            icon={TrendingUp}
            accent="from-emerald-500 to-emerald-700"
          />
          <StatCard
            label="Total Pengeluaran"
            value={summary.expense}
            change={expenseChange}
            icon={TrendingDown}
            accent="from-navy-700 to-navy-900"
            invertChange
          />
          <StatCard
            label="Saldo Saat Ini"
            value={summary.balance}
            change={incomeChange - expenseChange}
            icon={Wallet}
            accent="from-gray-600 to-gray-800"
          />
          <StatCard
            label="Tingkat Tabungan"
            value={summary.savingsRate}
            change={0}
            icon={PiggyBank}
            accent="from-emerald-600 to-navy-800"
            isCurrency={false}
            suffix="%"
          />
        </div>
      )}

      {/* Charts */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <SectionCard
            title="Pemasukan vs Pengeluaran"
            subtitle="Tren 6 bulan terakhir"
            className="lg:col-span-3"
          >
            <IncomeExpenseChart data={monthlyChart} highlightKey={effectiveMonth} />
          </SectionCard>

          <SectionCard
            title="Rincian Kategori"
            subtitle="Pengeluaran per kategori bulan ini"
            className="lg:col-span-2"
          >
            {categories.length > 0 ? (
              <CategoryBreakdownChart data={categories} />
            ) : (
              <EmptyState
                icon={Inbox}
                title="Belum ada data kategori"
                description="Data kategori pengeluaran akan muncul di sini."
              />
            )}
          </SectionCard>
        </div>
      )}

      {/* Recent transactions + Financial health */}
      {hasData && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <SectionCard
            title="Transaksi Terbaru"
            subtitle={`${monthTransactions.length} transaksi bulan ini`}
            className="lg:col-span-3"
          >
            <RecentTransactions transactions={monthTransactions} maxItems={6} />
          </SectionCard>

          <SectionCard
            title="Kesehatan Keuangan"
            subtitle="Ringkasan metrik keuangan"
            className="lg:col-span-2"
          >
            {healthMetrics.length > 0 ? (
              <FinancialHealth metrics={healthMetrics} />
            ) : (
              <EmptyState
                icon={Inbox}
                title="Belum ada metrik"
                description="Metrik kesehatan keuangan akan muncul setelah ada transaksi."
              />
            )}
          </SectionCard>
        </div>
      )}

      {/* Balance summary bar */}
      {hasData && (
        <div className="rounded-2xl bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 p-6 text-white shadow-card-lg overflow-hidden relative">
          <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-navy-300">Saldo Bersih Bulan Ini</p>
              <p className="mt-1 text-3xl font-extrabold">{formatIDR(summary.balance)}</p>
              <p className="mt-1 text-sm text-emerald-400">
                Tingkat tabungan {summary.savingsRate}% dari pemasukan
              </p>
            </div>
            <div className="flex gap-6 sm:gap-8">
              <div className="text-center">
                <p className="text-xs text-navy-300">Pemasukan</p>
                <p className="text-lg font-bold text-emerald-400">{formatIDR(summary.income)}</p>
              </div>
              <div className="h-12 w-px bg-navy-600 hidden sm:block" />
              <div className="text-center">
                <p className="text-xs text-navy-300">Pengeluaran</p>
                <p className="text-lg font-bold text-white">{formatIDR(summary.expense)}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
