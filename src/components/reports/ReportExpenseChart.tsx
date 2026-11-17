import { formatIDR } from '@/utils/format';
import type { ReportData } from '@/lib/reportAggregation';

interface ReportExpenseChartProps {
  data: ReportData;
}

export default function ReportExpenseChart({ data }: ReportExpenseChartProps) {
  if (data.topExpenses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-400">Tidak ada pengeluaran pada periode ini</p>
      </div>
    );
  }

  const maxAmount = Math.max(...data.topExpenses.map((e) => e.amount));

  return (
    <div className="space-y-3">
      {data.topExpenses.map((e) => (
        <div key={e.category}>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-medium text-navy-900">{e.category}</span>
            <span className="text-gray-500">
              {formatIDR(e.amount)} · {e.percentage}%
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${maxAmount > 0 ? (e.amount / maxAmount) * 100 : 0}%`,
                backgroundColor: e.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
