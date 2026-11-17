import { useState, useMemo, useEffect } from 'react';
import {
  Loader2,
  AlertCircle,
  FileDown,
  FileBarChart,
  Inbox,
  Info,
} from 'lucide-react';
import { useTransactions } from '@/hooks/useTransactions';
import { useBudgets } from '@/hooks/useBudgets';
import { useDebts } from '@/hooks/useDebts';
import { useGoals } from '@/hooks/useGoals';
import {
  getAvailableReportPeriods,
  getPeriodForKey,
  generateReportData,
  type ReportPeriodType,
} from '@/lib/reportAggregation';
import { exportReportToPdf } from '@/lib/pdfExport';
import ReportPeriodSelector from '@/components/reports/ReportPeriodSelector';
import ReportSummary from '@/components/reports/ReportSummary';
import ReportExpenseChart from '@/components/reports/ReportExpenseChart';
import ReportBudgetTable from '@/components/reports/ReportBudgetTable';
import ReportProgress from '@/components/reports/ReportProgress';
import SectionCard from '@/components/dashboard/SectionCard';

export default function ReportsPage() {
  const { transactions, loading: txLoading, error: txError, refetch: refetchTx } = useTransactions();
  const { debts, loading: debtLoading, error: debtError } = useDebts();
  const { goals, loading: goalsLoading, error: goalsError } = useGoals();
  // Budgets are month-scoped; load current month's budgets for budget-performance section
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const { budgets, loading: budgetLoading, error: budgetError } = useBudgets(currentMonthKey);

  const [periodType, setPeriodType] = useState<ReportPeriodType>('monthly');
  const availablePeriods = useMemo(
    () => getAvailableReportPeriods(transactions, periodType),
    [transactions, periodType]
  );
  const [selectedKey, setSelectedKey] = useState<string>('');

  // Default to first available period when type changes
  useEffect(() => {
    if (availablePeriods.length > 0 && !availablePeriods.find((p) => p.key === selectedKey)) {
      setSelectedKey(availablePeriods[0].key);
    }
  }, [availablePeriods, selectedKey]);

  const period = useMemo(
    () => (selectedKey ? getPeriodForKey(periodType, selectedKey) : null),
    [periodType, selectedKey]
  );

  const reportData = useMemo(() => {
    if (!period) return null;
    return generateReportData(transactions, budgets, debts, goals, period);
  }, [transactions, budgets, debts, goals, period]);

  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!reportData) return;
    setExporting(true);
    setExportError(null);
    try {
      exportReportToPdf(reportData);
      // Give the browser a tick to trigger the download before clearing the spinner
      await new Promise((r) => setTimeout(r, 300));
    } catch (err) {
      setExportError('Gagal menghasilkan PDF. Silakan coba lagi.');
    } finally {
      setExporting(false);
    }
  };

  const isLoading = txLoading || debtLoading || goalsLoading || budgetLoading;
  const hasError = txError || debtError || goalsError || budgetError;

  if (isLoading && transactions.length === 0 && debts.length === 0 && goals.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (hasError && transactions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>
          <p className="text-sm font-semibold text-navy-900">Gagal memuat data laporan</p>
          <p className="mt-1 text-sm text-gray-500 max-w-xs">{hasError}</p>
          <button onClick={() => refetchTx()} className="btn-primary mt-5">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Laporan Keuangan</h2>
          <p className="text-sm text-gray-500 mt-1">
            Laporan periodik berdasarkan transaksi, anggaran, utang, dan tujuan keuangan Anda
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <ReportPeriodSelector
            type={periodType}
            onTypeChange={(t) => {
              setPeriodType(t);
              setSelectedKey(''); // reset so effect picks first available
            }}
            periods={availablePeriods}
            value={selectedKey}
            onChange={setSelectedKey}
          />
          <button
            onClick={handleExport}
            disabled={!reportData || exporting || !reportData.hasTransactionData}
            className="btn-primary shrink-0 disabled:opacity-50"
          >
            {exporting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            Unduh PDF
          </button>
        </div>
      </div>

      {/* Export error */}
      {exportError && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{exportError}</p>
        </div>
      )}

      {/* Period display */}
      {reportData && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FileBarChart className="w-4 h-4 text-emerald-600" />
            <span>
              Periode laporan:{' '}
              <span className="font-semibold text-navy-900">{reportData.period.label}</span>
            </span>
          </div>
          <span className="text-xs text-gray-400">
            {reportData.period.startDate} s/d {reportData.period.endDate}
          </span>
        </div>
      )}

      {/* No transaction data in period */}
      {reportData && !reportData.hasTransactionData && (
        <div className="card p-8">
          <div className="flex flex-col items-center justify-center text-center py-8">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-navy-900">
              Tidak ada transaksi pada periode ini
            </p>
            <p className="mt-1 text-sm text-gray-500 max-w-sm">
              Laporan hanya mencakup data nyata. Pilih periode lain yang memiliki transaksi,
              atau tambahkan transaksi baru di halaman Transaksi.
            </p>
          </div>
        </div>
      )}

      {/* Report content */}
      {reportData && reportData.hasTransactionData && (
        <>
          {/* Summary */}
          <ReportSummary data={reportData} />

          {/* Expense categories */}
          <SectionCard
            title="Pengeluaran per Kategori"
            subtitle={`Total pengeluaran periode ini`}
          >
            <ReportExpenseChart data={reportData} />
          </SectionCard>

          {/* Budget performance */}
          {reportData.budgetPerformance.length > 0 && (
            <SectionCard
              title="Kinerja Anggaran"
              subtitle="Perbandingan limit anggaran dengan pengeluaran nyata"
            >
              <ReportBudgetTable data={reportData} />
            </SectionCard>
          )}

          {/* Debt & Goals progress */}
          <SectionCard
            title="Progres Utang & Tujuan"
            subtitle="Kondisi terkini utang dan tujuan keuangan"
          >
            <ReportProgress data={reportData} />
          </SectionCard>

          {/* Educational note */}
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-blue-50/60 border border-blue-100">
            <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-xs text-blue-800">
              Laporan ini dihasilkan sepenuhnya dari data nyata yang Anda catat di Finora —
              tanpa data demo. Angka bersifat rekapitulatif untuk kebutuhan edukasi dan
              pemantauan pribadi, bukan saran dari penasihat keuangan berizin.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
