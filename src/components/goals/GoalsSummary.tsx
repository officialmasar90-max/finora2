import { Target, CheckCircle2, TrendingUp, Calendar } from 'lucide-react';
import { formatIDR } from '@/utils/format';
import type { Goal } from '@/hooks/useGoals';
import { calculateGoalMetrics } from '@/lib/goalCalculations';

interface GoalsSummaryProps {
  goals: Goal[];
}

export default function GoalsSummary({ goals }: GoalsSummaryProps) {
  const activeGoals = goals.filter((g) => {
    const m = calculateGoalMetrics({
      id: g.id,
      target_amount: Number(g.target_amount),
      current_savings: Number(g.current_savings),
      deadline: g.deadline,
      is_achieved: g.is_achieved,
    });
    return m.remaining > 0;
  });
  const achievedGoals = goals.length - activeGoals.length;

  const totalTarget = goals.reduce((s, g) => s + Number(g.target_amount), 0);
  const totalSaved = goals.reduce((s, g) => s + Number(g.current_savings), 0);
  const overallProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;
  const totalMonthlyNeeded = activeGoals.reduce((s, g) => {
    const m = calculateGoalMetrics({
      id: g.id,
      target_amount: Number(g.target_amount),
      current_savings: Number(g.current_savings),
      deadline: g.deadline,
      is_achieved: g.is_achieved,
    });
    return s + (m.requiredMonthlyContribution ?? 0);
  }, 0);

  const cards = [
    {
      label: 'Total Target',
      value: formatIDR(totalTarget),
      icon: Target,
      accent: 'from-navy-700 to-navy-900',
      sub: `${goals.length} tujuan`,
    },
    {
      label: 'Total Tersimpan',
      value: formatIDR(totalSaved),
      icon: TrendingUp,
      accent: 'from-emerald-600 to-emerald-800',
      sub: `${overallProgress}% dari target`,
    },
    {
      label: 'Kebutuhan / Bulan',
      value: formatIDR(totalMonthlyNeeded),
      icon: Calendar,
      accent: 'from-amber-500 to-amber-700',
      sub: activeGoals.length > 0 ? `${activeGoals.length} tujuan aktif` : 'Tidak ada tujuan aktif',
    },
    {
      label: 'Tujuan Tercapai',
      value: String(achievedGoals),
      icon: CheckCircle2,
      accent: 'from-emerald-500 to-emerald-700',
      sub: achievedGoals > 0 ? 'Selamat!' : 'Belum ada yang tercapai',
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
