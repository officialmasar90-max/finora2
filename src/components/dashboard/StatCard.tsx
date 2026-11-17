import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { formatIDR } from '@/utils/format';

interface StatCardProps {
  label: string;
  value: number;
  change: number;
  icon: LucideIcon;
  accent: string;
  isCurrency?: boolean;
  suffix?: string;
  invertChange?: boolean;
}

export default function StatCard({
  label,
  value,
  change,
  icon: Icon,
  accent,
  isCurrency = true,
  suffix,
  invertChange = false,
}: StatCardProps) {
  const isPositive = invertChange ? change < 0 : change > 0;
  const trendUp = change > 0;

  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-11 h-11 rounded-xl bg-gradient-to-br ${accent} flex items-center justify-center shadow-sm`}
        >
          <Icon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <span
          className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-1 rounded-lg ${
            isPositive ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          }`}
        >
          {trendUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}%
        </span>
      </div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-navy-900">
        {isCurrency ? formatIDR(value) : value.toLocaleString('id-ID')}
        {suffix && <span className="text-base text-gray-400 font-medium">{suffix}</span>}
      </p>
    </div>
  );
}
