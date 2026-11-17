import { ArrowUpRight, ArrowDownRight, Scale, PiggyBank } from 'lucide-react';
import { formatIDR } from '@/utils/format';
import type { ReportData } from '@/lib/reportAggregation';

interface ReportSummaryProps {
  data: ReportData;
}

export default function ReportSummary({ data }: ReportSummaryProps) {
  const isPositiveCashFlow = data.cashFlow >= 0;

  const cards = [
    {
      label: 'Pendapatan',
      value: formatIDR(data.income),
      icon: ArrowUpRight,
      accent: 'bg-emerald-50 text-emerald-700',
      sub: `${data.transactionCount} transaksi`,
    },
    {
      label: 'Pengeluaran',
      value: formatIDR(data.expenses),
      icon: ArrowDownRight,
      accent: 'bg-red-50 text-red-600',
      sub: `${data.topExpenses.length} kategori`,
    },
    {
      label: 'Arus Kas Bersih',
      value: formatIDR(data.cashFlow),
      icon: Scale,
      accent: isPositiveCashFlow ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600',
      sub: isPositiveCashFlow ? 'Surplus' : 'Defisit',
    },
    {
      label: 'Rasio Tabungan',
      value: `${data.savingsRate}%`,
      icon: PiggyBank,
      accent: data.savingsRate >= 20 ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700',
      sub: data.income > 0 ? 'dari pendapatan' : 'tidak ada pendapatan',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="card p-4 sm:p-5">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center mb-3 ${card.accent}`}
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
            </div>
            <p className="text-xs sm:text-sm text-gray-500">{card.label}</p>
            <p className="mt-1 text-lg sm:text-xl font-bold text-navy-900">{card.value}</p>
            <p className="mt-0.5 text-xs text-gray-400">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
