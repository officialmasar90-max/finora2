import { formatIDR } from '@/utils/format';
import { getCategoryConfig } from '@/config/categories';
import type { CategoryBreakdownItem } from '@/hooks/useTransactions';

interface CategoryBreakdownChartProps {
  data: CategoryBreakdownItem[];
}

export default function CategoryBreakdownChart({ data }: CategoryBreakdownChartProps) {
  const total = data.reduce((sum, d) => sum + d.amount, 0);

  // Donut chart using conic-gradient
  let cumulative = 0;
  const segments = data.map((d) => {
    const pct = (d.amount / total) * 100;
    const start = cumulative;
    cumulative += pct;
    return { ...d, pct, start, end: cumulative };
  });

  const gradientStops = segments
    .map((s) => `${s.color} ${s.start * 3.6}deg ${s.end * 3.6}deg`)
    .join(', ');

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      {/* Donut */}
      <div className="relative shrink-0">
        <div
          className="w-40 h-40 rounded-full"
          style={{ background: `conic-gradient(${gradientStops})` }}
        />
        <div className="absolute inset-4 rounded-full bg-white flex flex-col items-center justify-center shadow-inner">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-sm font-bold text-navy-900 text-center px-2">{formatIDR(total)}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 w-full space-y-2.5">
        {segments.map((s) => {
          const cat = getCategoryConfig(s.category);
          const Icon = cat.icon;
          return (
            <div key={s.category} className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${s.color}15` }}
                >
                  <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                </div>
                <span className="text-sm font-medium text-navy-900 truncate">{s.category}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-gray-400">{s.pct.toFixed(0)}%</span>
                <span className="text-sm font-semibold text-navy-900 w-24 text-right">
                  {formatIDR(s.amount)}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
