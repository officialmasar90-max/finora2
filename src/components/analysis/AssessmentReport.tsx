import {
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  TrendingUp,
  Lightbulb,
  Calculator,
  Info,
} from 'lucide-react';
import type { AssessmentMetrics } from '@/lib/financialCalculations';
import type { FinancialReport, ReportItem } from '@/lib/financialReport';
import { formatIDR } from '@/utils/format';

interface AssessmentReportProps {
  metrics: AssessmentMetrics;
  report: FinancialReport;
  createdAt?: string;
}

function StatusBadge({ status }: { status: 'good' | 'warning' | 'critical' }) {
  const config = {
    good: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Sehat' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Perlu Perhatian' },
    critical: { bg: 'bg-red-50', text: 'text-red-700', label: 'Kritis' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

function MetricRow({
  label,
  value,
  formula,
  interpretation,
  status,
  isCurrency,
}: {
  label: string;
  value: number | string;
  formula: string;
  interpretation: string;
  status: 'good' | 'warning' | 'critical';
  isCurrency?: boolean;
}) {
  return (
    <div className="py-3.5 border-b border-gray-50 last:border-0">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <span className="text-sm font-semibold text-navy-900">{label}</span>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm font-bold text-navy-900">
            {isCurrency ? formatIDR(Number(value)) : value}
          </span>
          <StatusBadge status={status} />
        </div>
      </div>
      <p className="text-xs text-gray-400 flex items-start gap-1.5">
        <Calculator className="w-3.5 h-3.5 shrink-0 mt-0.5 text-gray-300" />
        {formula}
      </p>
      <p className="mt-1 text-sm text-gray-600">{interpretation}</p>
    </div>
  );
}

function ReportSection({
  title,
  items,
  icon: Icon,
  accent,
}: {
  title: string;
  items: ReportItem[];
  icon: typeof CheckCircle2;
  accent: string;
}) {
  if (items.length === 0) return null;
  return (
    <div className="card p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`w-9 h-9 rounded-xl ${accent} flex items-center justify-center`}>
          <Icon className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-base font-bold text-navy-900">{title}</h3>
        <span className="text-xs font-medium text-gray-400">({items.length})</span>
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="pl-1">
            <p className="text-sm font-semibold text-navy-900">{item.title}</p>
            <p className="mt-0.5 text-sm text-gray-600 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AssessmentReport({ metrics, report, createdAt }: AssessmentReportProps) {
  const overallConfig = {
    good: { bg: 'from-emerald-600 to-emerald-700', label: 'Kesehatan Keuangan: Sehat' },
    warning: { bg: 'from-amber-500 to-amber-600', label: 'Kesehatan Keuangan: Perlu Perhatian' },
    critical: { bg: 'from-red-500 to-red-600', label: 'Kesehatan Keuangan: Kritis' },
  };
  const oc = overallConfig[report.overallStatus];

  return (
    <div className="space-y-6">
      {/* Overall summary banner */}
      <div className={`rounded-2xl bg-gradient-to-br ${oc.bg} p-6 text-white shadow-card-lg overflow-hidden relative`}>
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />
        <div className="relative">
          <p className="text-sm text-white/80">{oc.label}</p>
          <p className="mt-2 text-base leading-relaxed">{report.overallSummary}</p>
          {createdAt && (
            <p className="mt-3 text-xs text-white/60">
              Laporan dibuat pada {new Date(createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })} WIB
            </p>
          )}
        </div>
      </div>

      {/* Metrics breakdown */}
      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-bold text-navy-900">Hasil Perhitungan Metrik</h3>
        </div>
        <div className="flex items-start gap-2 mb-4 px-3 py-2.5 rounded-xl bg-navy-50">
          <Info className="w-4 h-4 text-navy-400 shrink-0 mt-0.5" />
          <p className="text-xs text-navy-500 leading-relaxed">
            Semua metrik dihitung secara deterministik dari input Anda menggunakan rumus standar keuangan.
            Tidak ada data yang diciptakan atau dugaan yang dibuat untuk nilai yang tidak diisi.
          </p>
        </div>

        <MetricRow
          label="Arus Kas Bersih Bulanan"
          value={metrics.netCashFlow.value}
          formula={metrics.netCashFlow.formula}
          interpretation={metrics.netCashFlow.interpretation}
          status={metrics.netCashFlow.status}
          isCurrency
        />
        <MetricRow
          label={metrics.savingsRatio.label}
          value={`${metrics.savingsRatio.value}%`}
          formula={metrics.savingsRatio.formula}
          interpretation={metrics.savingsRatio.interpretation}
          status={metrics.savingsRatio.status}
        />
        <MetricRow
          label={metrics.debtToIncomeRatio.label}
          value={`${metrics.debtToIncomeRatio.value}%`}
          formula={metrics.debtToIncomeRatio.formula}
          interpretation={metrics.debtToIncomeRatio.interpretation}
          status={metrics.debtToIncomeRatio.status}
        />
        <MetricRow
          label={metrics.essentialExpenseRatio.label}
          value={`${metrics.essentialExpenseRatio.value}%`}
          formula={metrics.essentialExpenseRatio.formula}
          interpretation={metrics.essentialExpenseRatio.interpretation}
          status={metrics.essentialExpenseRatio.status}
        />
        <MetricRow
          label={metrics.nonEssentialExpenseRatio.label}
          value={`${metrics.nonEssentialExpenseRatio.value}%`}
          formula={metrics.nonEssentialExpenseRatio.formula}
          interpretation={metrics.nonEssentialExpenseRatio.interpretation}
          status={metrics.nonEssentialExpenseRatio.status}
        />
        <MetricRow
          label={metrics.totalExpenseRatio.label}
          value={`${metrics.totalExpenseRatio.value}%`}
          formula={metrics.totalExpenseRatio.formula}
          interpretation={metrics.totalExpenseRatio.interpretation}
          status={metrics.totalExpenseRatio.status}
        />
        <MetricRow
          label={metrics.emergencyFundCoverage.label}
          value={`${metrics.emergencyFundCoverage.value} bulan`}
          formula={metrics.emergencyFundCoverage.formula}
          interpretation={metrics.emergencyFundCoverage.interpretation}
          status={metrics.emergencyFundCoverage.status}
        />
      </div>

      {/* Report sections */}
      <ReportSection
        title="Kekuatan Finansial"
        items={report.strengths}
        icon={CheckCircle2}
        accent="bg-emerald-500"
      />

      <ReportSection
        title="Masalah Keuangan Utama"
        items={report.problems}
        icon={AlertTriangle}
        accent="bg-red-500"
      />

      <ReportSection
        title="Potensi Risiko"
        items={report.risks}
        icon={ShieldAlert}
        accent="bg-amber-500"
      />

      <ReportSection
        title="Area yang Perlu Diperbaiki"
        items={report.improvements}
        icon={TrendingUp}
        accent="bg-navy-700"
      />

      <ReportSection
        title="Rekomendasi Tindakan"
        items={report.recommendations}
        icon={Lightbulb}
        accent="bg-emerald-600"
      />
    </div>
  );
}
