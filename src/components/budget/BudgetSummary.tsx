import { Wallet, TrendingDown, CircleDollarSign, AlertTriangle } from 'lucide-react';
import { formatIDR } from '@/utils/format';

interface BudgetSummaryProps {
  totalBudget: number;
  totalSpent: number;
  totalRemaining: number;
  budgetCount: number;
  warningCount: number;
}

export default function BudgetSummary({
  totalBudget,
  totalSpent,
  totalRemaining,
  budgetCount,
  warningCount,
}: BudgetSummaryProps) {
  const spentPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  const cards = [
    {
      label: 'Total Anggaran',
      value: formatIDR(totalBudget),
      icon: Wallet,
      accent: 'from-emerald-500 to-emerald-700',
      sub: `${budgetCount} kategori`,
    },
    {
      label: 'Total Pengeluaran',
      value: formatIDR(totalSpent),
      icon: TrendingDown,
      accent: 'from-navy-700 to-navy-900',
      sub: `${spentPercentage}% dari anggaran`,
    },
    {
      label: 'Sisa Anggaran',
      value: formatIDR(totalRemaining),
      icon: CircleDollarSign,
      accent: totalRemaining >= 0 ? 'from-emerald-600 to-emerald-800' : 'from-red-500 to-red-700',
      sub: totalRemaining >= 0 ? 'Masih dalam batas' : 'Anggaran terlampaui',
    },
    {
      label: 'Perlu Perhatian',
      value: String(warningCount),
      icon: AlertTriangle,
      accent: warningCount > 0 ? 'from-amber-500 to-amber-700' : 'from-gray-400 to-gray-600',
      sub: warningCount > 0 ? 'Kategori mendekati/melebihi batas' : 'Semua aman',
      isCurrency: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.label} className="card p-4 sm:p-5">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${card.accent} flex items-center justify-center shadow-sm mb-3`}
            >
              <Icon className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <p className="text-xs sm:text-sm text-gray-500">{card.label}</p>
            <p className="mt-1 text-lg sm:text-xl font-bold text-navy-900">
              {card.isCurrency ? card.value : card.value}
            </p>
            <p className="mt-0.5 text-xs text-gray-400">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
