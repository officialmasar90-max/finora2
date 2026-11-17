import { useState, useMemo } from 'react';
import { TrendingUp, AlertCircle, Loader2, History, FileText, Plus } from 'lucide-react';
import { calculateAllMetrics } from '@/lib/financialCalculations';
import { generateReport } from '@/lib/financialReport';
import type { AssessmentInput } from '@/lib/financialCalculations';
import {
  useAssessments,
  toInsertRow,
  toInput,
  type AssessmentRecord,
  type AssessmentReportData,
} from '@/hooks/useAssessments';
import AssessmentForm from '@/components/analysis/AssessmentForm';
import AssessmentReport from '@/components/analysis/AssessmentReport';
import AssessmentHistory from '@/components/analysis/AssessmentHistory';

type View = 'form' | 'report';

export default function AnalysisPage() {
  const { assessments, loading, error, saveAssessment, deleteAssessment } = useAssessments();
  const [view, setView] = useState<View>('form');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [activeReport, setActiveReport] = useState<{
    metrics: ReturnType<typeof calculateAllMetrics>;
    report: ReturnType<typeof generateReport>;
    createdAt?: string;
  } | null>(null);
  const [selectedHistoryId, setSelectedHistoryId] = useState<string | undefined>();
  const [showHistory, setShowHistory] = useState(false);

  const hasHistory = assessments.length > 0;

  const handleFormSubmit = async (input: AssessmentInput) => {
    setSubmitError(null);
    setSubmitting(true);

    const metrics = calculateAllMetrics(input);
    const report = generateReport(input, metrics);
    const reportData: AssessmentReportData = { metrics, report };

    const { error: saveError } = await saveAssessment(toInsertRow(input, reportData));

    setSubmitting(false);

    if (saveError) {
      setSubmitError('Gagal menyimpan asesmen. Silakan coba lagi.');
      return;
    }

    setActiveReport({ metrics, report });
    setView('report');
  };

  const handleViewHistoryItem = (record: AssessmentRecord) => {
    const input = toInput(record);
    const metrics = calculateAllMetrics(input);
    const report = generateReport(input, metrics);
    setActiveReport({ metrics, report, createdAt: record.created_at });
    setSelectedHistoryId(record.id);
    setView('report');
    setShowHistory(false);
  };

  const handleDeleteHistory = async (id: string) => {
    const { error: delError } = await deleteAssessment(id);
    if (delError) {
      setSubmitError('Gagal menghapus asesmen. Silakan coba lagi.');
      return;
    }
    if (selectedHistoryId === id) {
      setSelectedHistoryId(undefined);
      setActiveReport(null);
      setView('form');
    }
  };

  const handleNewAssessment = () => {
    setActiveReport(null);
    setSelectedHistoryId(undefined);
    setView('form');
  };

  const pageTitle = useMemo(() => {
    if (view === 'report') return 'Laporan Asesmen';
    return 'Analisis Keuangan';
  }, [view]);

  if (loading && view === 'form' && !hasHistory) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error && view === 'form' && !hasHistory) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-navy-900">Gagal memuat data asesmen</p>
        <p className="mt-1 text-sm text-gray-500 max-w-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">{pageTitle}</h2>
          <p className="text-sm text-gray-500 mt-1">
            {view === 'form'
              ? 'Isi data keuangan Anda untuk mendapatkan laporan kesehatan finansial'
              : 'Hasil analisis kesehatan keuangan berdasarkan input Anda'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {view === 'report' && (
            <button onClick={handleNewAssessment} className="btn-primary">
              <Plus className="w-4 h-4" />
              Asesmen Baru
            </button>
          )}
          {hasHistory && (
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                showHistory
                  ? 'bg-navy-900 text-white'
                  : 'bg-white text-navy-900 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <History className="w-4 h-4" />
              Riwayat ({assessments.length})
            </button>
          )}
        </div>
      </div>

      {/* Submit error */}
      {submitError && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{submitError}</p>
        </div>
      )}

      {/* Main content area */}
      <div
        className={`grid gap-6 ${
          showHistory && hasHistory
            ? 'lg:grid-cols-[1fr_340px]'
            : 'grid-cols-1'
        }`}
      >
        {/* Left: Form or Report */}
        <div className="min-w-0">
          {view === 'form' ? (
            <div className="card p-5 sm:p-6">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-sm">
                  <TrendingUp className="w-5 h-5 text-white" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-navy-900">Formulir Asesmen Keuangan</h3>
                  <p className="text-sm text-gray-500">
                    Semua nilai dalam Rupiah (Rp). Isi sesuai kondisi keuangan Anda saat ini.
                  </p>
                </div>
              </div>
              <AssessmentForm onSubmit={handleFormSubmit} loading={submitting} />
            </div>
          ) : (
            activeReport && (
              <AssessmentReport
                metrics={activeReport.metrics}
                report={activeReport.report}
                createdAt={activeReport.createdAt}
              />
            )
          )}
        </div>

        {/* Right: History sidebar (toggled) */}
        {showHistory && hasHistory && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-1">
              <FileText className="w-4 h-4 text-gray-400" />
              <h3 className="text-sm font-bold text-navy-900">Riwayat Asesmen</h3>
            </div>
            <AssessmentHistory
              assessments={assessments}
              loading={loading}
              onView={handleViewHistoryItem}
              onDelete={handleDeleteHistory}
              selectedId={selectedHistoryId}
            />
          </div>
        )}
      </div>
    </div>
  );
}
