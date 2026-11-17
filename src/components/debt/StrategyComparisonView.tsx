import { Snowflake, TrendingDown, Info, CheckCircle2 } from 'lucide-react';
import { formatIDR } from '@/utils/format';
import { formatMonths, type StrategyComparison, type RepaymentResult } from '@/lib/debtCalculations';

interface StrategyComparisonProps {
  comparison: StrategyComparison;
}

function StrategyCard({
  result,
  isActive,
  icon,
  iconBg,
  label,
  description,
}: {
  result: RepaymentResult;
  isActive: boolean;
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  description: string;
}) {
  return (
    <div
      className={`card p-5 transition-all duration-200 ${
        isActive ? 'ring-2 ring-emerald-500 shadow-card-hover' : ''
      }`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-bold text-navy-900">{label}</h4>
            {isActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                <CheckCircle2 className="w-3 h-3" /> Direkomendasikan
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Estimasi waktu pelunasan</span>
          <span className="font-bold text-navy-900">{formatMonths(result.totalMonths)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Total bunga estimasi</span>
          <span className="font-bold text-navy-900">{formatIDR(result.totalInterest)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">Total dibayar estimasi</span>
          <span className="font-bold text-navy-900">{formatIDR(result.totalPaid)}</span>
        </div>
      </div>

      {/* Per-debt breakdown */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs font-semibold text-gray-400 mb-2">Rincian per utang</p>
        <div className="space-y-1.5">
          {result.schedules.map((s) => (
            <div key={s.debtId} className="flex items-center justify-between text-xs">
              <span className="text-gray-600 truncate max-w-[60%]">{s.debtName}</span>
              <span className="text-gray-500">
                {formatMonths(s.monthsToPayoff)} · bunga {formatIDR(s.totalInterest)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function StrategyComparisonView({ comparison }: StrategyComparisonProps) {
  const { snowball, avalanche, interestSavings, monthsSaved, recommendedStrategy, recommendationReason } = comparison;

  return (
    <div className="space-y-4">
      {/* Savings highlight */}
      {interestSavings > 0 && (
        <div className="card p-4 bg-emerald-50/50 border-emerald-100">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
              <TrendingDown className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <p className="text-sm font-bold text-navy-900">
                Avalanche menghemat {formatIDR(interestSavings)}
              </p>
              <p className="text-xs text-gray-500 mt-0.5">
                {monthsSaved > 0
                  ? `${monthsSaved} bulan lebih cepat dan ${formatIDR(interestSavings)} bunga lebih sedikit dibanding Snowball.`
                  : `${formatIDR(interestSavings)} bunga lebih sedikit dibanding Snowball.`}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Strategy cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StrategyCard
          result={snowball}
          isActive={recommendedStrategy === 'snowball'}
          icon={<Snowflake className="w-5 h-5 text-blue-600" />}
          iconBg="bg-blue-50"
          label="Snowball"
          description="Lunasi saldo terkecil lebih dulu untuk momentum psikologis"
        />
        <StrategyCard
          result={avalanche}
          isActive={recommendedStrategy === 'avalanche'}
          icon={<TrendingDown className="w-5 h-5 text-emerald-600" />}
          iconBg="bg-emerald-50"
          label="Avalanche"
          description="Lunasi bunga tertinggi lebih dulu untuk minimum total bunga"
        />
      </div>

      {/* Recommendation */}
      <div className="card p-4">
        <div className="flex items-start gap-2.5">
          <Info className="w-4 h-4 text-navy-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-navy-900">Rekomendasi</p>
            <p className="text-sm text-gray-600 mt-0.5">{recommendationReason}</p>
          </div>
        </div>
      </div>

      {/* Assumptions */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-gray-400" />
          <p className="text-sm font-semibold text-navy-900">Asumsi Perhitungan</p>
        </div>
        <ul className="space-y-1.5">
          {avalanche.assumptions.map((a, i) => (
            <li key={i} className="text-xs text-gray-500 flex items-start gap-2">
              <span className="text-gray-300 mt-0.5">•</span>
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Disclaimer */}
      <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
        <p className="text-xs text-amber-700">
          Peringatan: Estimasi ini adalah proyeksi sederhana untuk tujuan edukasi keuangan,
          bukan saran dari penasihat keuangan berizin. Ketentuan pinjaman aktual dapat berbeda.
          Hasil tidak menjamin pelunasan dalam waktu yang sama persis.
        </p>
      </div>
    </div>
  );
}
