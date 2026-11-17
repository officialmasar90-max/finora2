import { Activity, ShieldCheck } from 'lucide-react';
import type { HealthMetric } from '@/types/transaction';

interface FinancialHealthProps {
  metrics: HealthMetric[];
}

function getScoreColor(score: number): { text: string; bg: string; label: string } {
  if (score >= 75) return { text: 'text-emerald-600', bg: 'bg-emerald-500', label: 'Sehat' };
  if (score >= 50) return { text: 'text-amber-600', bg: 'bg-amber-500', label: 'Cukup' };
  return { text: 'text-red-600', bg: 'bg-red-500', label: 'Perlu Perhatian' };
}

export default function FinancialHealth({ metrics }: FinancialHealthProps) {
  const overall =
    metrics.length > 0
      ? Math.round(metrics.reduce((sum, m) => sum + m.score, 0) / metrics.length)
      : 0;
  const scoreInfo = getScoreColor(overall);

  return (
    <div>
      {/* Overall score */}
      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
        <div className="relative w-20 h-20 shrink-0">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="34" fill="none" stroke="#f3f4f6" strokeWidth="6" />
            <circle
              cx="40"
              cy="40"
              r="34"
              fill="none"
              stroke={overall >= 75 ? '#10b981' : overall >= 50 ? '#f59e0b' : '#ef4444'}
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={`${(overall / 100) * 213.6} 213.6`}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-xl font-extrabold ${scoreInfo.text}`}>{overall}</span>
            <span className="text-[9px] text-gray-400 font-medium">dari 100</span>
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" />
            <p className="text-sm font-bold text-navy-900">Skor Kesehatan Keuangan</p>
          </div>
          <p className={`text-sm font-semibold ${scoreInfo.text} mt-1`}>{scoreInfo.label}</p>
          <p className="text-xs text-gray-500 mt-1">
            Berdasarkan analisis 4 metrik keuangan utama bulan ini
          </p>
        </div>
      </div>

      {/* Individual metrics */}
      <div className="space-y-4">
        {metrics.map((metric) => {
          const pct = (metric.score / metric.max) * 100;
          return (
            <div key={metric.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-navy-900">{metric.label}</span>
                <span className="text-xs font-bold text-gray-700">{metric.score}/{metric.max}</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: metric.color }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-400">{metric.description}</p>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div className="mt-5 flex items-start gap-2 px-3 py-2.5 rounded-xl bg-navy-50">
        <ShieldCheck className="w-4 h-4 text-navy-400 shrink-0 mt-0.5" />
        <p className="text-xs text-navy-500 leading-relaxed">
          Skor dihitung otomatis dari data transaksi Anda bulan ini
        </p>
      </div>
    </div>
  );
}
