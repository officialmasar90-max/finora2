import { formatIDR } from '@/utils/format';
import type { MonthlyChartData } from '@/hooks/useTransactions';

interface IncomeExpenseChartProps {
  data: MonthlyChartData[];
  highlightKey?: string;
}

export default function IncomeExpenseChart({ data, highlightKey }: IncomeExpenseChartProps) {
  const maxVal = Math.max(...data.flatMap((d) => [d.income, d.expense])) * 1.15;

  return (
    <div>
      {/* Legend */}
      <div className="flex items-center gap-4 mb-4 text-xs">
        <span className="flex items-center gap-1.5 text-gray-600">
          <span className="w-3 h-3 rounded-full bg-emerald-500" /> Pemasukan
        </span>
        <span className="flex items-center gap-1.5 text-gray-600">
          <span className="w-3 h-3 rounded-full bg-navy-300" /> Pengeluaran
        </span>
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between gap-2 sm:gap-3 h-48">
        {data.map((d) => {
          const isHighlight = d.monthKey === highlightKey;
          const incomeH = (d.income / maxVal) * 100;
          const expenseH = (d.expense / maxVal) * 100;
          return (
            <div key={d.monthKey} className="flex-1 flex flex-col items-center gap-2 group">
              {/* Tooltip */}
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute -translate-y-2 z-10 pointer-events-none">
                <div className="bg-navy-900 text-white text-[11px] rounded-lg px-3 py-2 shadow-lg whitespace-nowrap">
                  <p className="text-emerald-400 font-semibold">{formatIDR(d.income)}</p>
                  <p className="text-navy-300">{formatIDR(d.expense)}</p>
                </div>
              </div>
              <div className="w-full flex items-end justify-center gap-1 h-40">
                <div
                  className={`w-1/2 rounded-t-md transition-all duration-300 ${
                    isHighlight ? 'bg-emerald-500' : 'bg-emerald-400/80 group-hover:bg-emerald-500'
                  }`}
                  style={{ height: `${incomeH}%` }}
                />
                <div
                  className={`w-1/2 rounded-t-md transition-all duration-300 ${
                    isHighlight ? 'bg-navy-400' : 'bg-navy-300/80 group-hover:bg-navy-400'
                  }`}
                  style={{ height: `${expenseH}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${isHighlight ? 'text-navy-900 font-bold' : 'text-gray-500'}`}>
                {d.monthLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
