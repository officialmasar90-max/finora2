import { formatIDR } from '@/utils/format';
import type { ReportData } from '@/lib/reportAggregation';

interface ReportBudgetTableProps {
  data: ReportData;
}

const statusConfig = {
  safe: { label: 'Aman', class: 'bg-emerald-50 text-emerald-700' },
  warning: { label: 'Mendekati batas', class: 'bg-amber-50 text-amber-700' },
  danger: { label: 'Melebihi batas', class: 'bg-red-50 text-red-700' },
  'no-spending': { label: 'Belum ada pengeluaran', class: 'bg-gray-100 text-gray-500' },
};

export default function ReportBudgetTable({ data }: ReportBudgetTableProps) {
  if (data.budgetPerformance.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-400">
          Tidak ada anggaran untuk periode ini. Atur anggaran di halaman Perencana Anggaran.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-400 border-b border-gray-100">
            <th className="pb-2 font-medium">Kategori</th>
            <th className="pb-2 font-medium text-right">Limit</th>
            <th className="pb-2 font-medium text-right">Terpakai</th>
            <th className="pb-2 font-medium text-right">Sisa</th>
            <th className="pb-2 font-medium text-right">Progres</th>
            <th className="pb-2 font-medium text-right">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.budgetPerformance.map((b) => {
            const cfg = statusConfig[b.status];
            return (
              <tr key={b.category} className="border-b border-gray-50 last:border-0">
                <td className="py-2.5 font-medium text-navy-900">{b.category}</td>
                <td className="py-2.5 text-right text-gray-600">{formatIDR(b.limit)}</td>
                <td className="py-2.5 text-right text-gray-600">{formatIDR(b.spent)}</td>
                <td className={`py-2.5 text-right ${b.remaining >= 0 ? 'text-emerald-600' : 'text-red-600'} font-semibold`}>
                  {b.remaining >= 0 ? formatIDR(b.remaining) : formatIDR(Math.abs(b.remaining))}
                </td>
                <td className="py-2.5 text-right text-gray-600">{b.percentage}%</td>
                <td className="py-2.5 text-right">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.class}`}>
                    {cfg.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
