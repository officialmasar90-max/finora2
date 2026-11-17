import { CreditCard, TrendingDown, Calendar, Wallet } from 'lucide-react';
import { formatIDR } from '@/utils/format';
import type { Debt } from '@/hooks/useDebts';

interface DebtSummaryProps {
  debts: Debt[];
}

export default function DebtSummary({ debts }: DebtSummaryProps) {
  const activeDebts = debts.filter((d) => !d.is_paid_off);
  const paidDebts = debts.filter((d) => d.is_paid_off);

  const totalPrincipal = activeDebts.reduce((s, d) => s + Number(d.principal), 0);
  const totalInstallment = activeDebts.reduce((s, d) => s + Number(d.monthly_installment), 0);
  const estimatedMonthlyInterest = activeDebts.reduce(
    (s, d) => s + Number(d.principal) * (Number(d.interest_rate) / 100 / 12),
    0
  );
  const averageRate =
    activeDebts.length > 0
      ? activeDebts.reduce((s, d) => s + Number(d.interest_rate), 0) / activeDebts.length
      : 0;

  const cards = [
    {
      label: 'Total Utang Aktif',
      value: formatIDR(totalPrincipal),
      icon: CreditCard,
      accent: 'from-navy-700 to-navy-900',
      sub: `${activeDebts.length} utang aktif`,
    },
    {
      label: 'Cicilan / Bulan',
      value: formatIDR(totalInstallment),
      icon: Calendar,
      accent: 'from-emerald-600 to-emerald-800',
      sub: 'Total kewajiban bulanan',
    },
    {
      label: 'Estimasi Bunga / Bulan',
      value: formatIDR(Math.round(estimatedMonthlyInterest)),
      icon: TrendingDown,
      accent: 'from-amber-500 to-amber-700',
      sub: `Rata-rata bunga ${averageRate.toFixed(1)}% / tahun`,
    },
    {
      label: 'Utang Lunas',
      value: String(paidDebts.length),
      icon: Wallet,
      accent: 'from-emerald-500 to-emerald-700',
      sub: paidDebts.length > 0 ? 'Sudah dilunasi' : 'Belum ada yang lunas',
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
            <p className="mt-1 text-lg sm:text-xl font-bold text-navy-900">{card.value}</p>
            <p className="mt-0.5 text-xs text-gray-400">{card.sub}</p>
          </div>
        );
      })}
    </div>
  );
}
