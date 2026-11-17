import { Pencil, Trash2, Calendar, CheckCircle2, Target, AlertTriangle, Plus, Minus } from 'lucide-react';
import { formatIDR, formatDateID } from '@/utils/format';
import type { Goal } from '@/hooks/useGoals';
import { calculateGoalMetrics, goalCategories } from '@/lib/goalCalculations';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onUpdateSavings: (goal: Goal, delta: number) => void;
  onToggleAchieved: (goal: Goal) => void;
}

export default function GoalCard({
  goal,
  onEdit,
  onDelete,
  onUpdateSavings,
  onToggleAchieved,
}: GoalCardProps) {
  const metrics = calculateGoalMetrics({
    id: goal.id,
    target_amount: Number(goal.target_amount),
    current_savings: Number(goal.current_savings),
    deadline: goal.deadline,
    is_achieved: goal.is_achieved,
  });

  const categoryConfig = goalCategories.find((c) => c.label === goal.category);
  const color = categoryConfig?.color ?? '#9ca3af';
  const isAchieved = goal.is_achieved || metrics.remaining === 0;

  const quickAdd = 100000; // Rp 100rb quick add

  return (
    <div className={`card card-hover p-5 group ${isAchieved ? 'ring-2 ring-emerald-500/40' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${color}15` }}
          >
            <Target className="w-5 h-5" style={{ color }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-navy-900 truncate">{goal.name}</p>
            <p className="text-xs text-gray-400">{goal.category}</p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleAchieved(goal)}
            className={`p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
              isAchieved
                ? 'text-gray-400 hover:bg-gray-100 hover:text-navy-900'
                : 'text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'
            }`}
            aria-label={isAchieved ? 'Tandai belum tercapai' : 'Tandai tercapai'}
            title={isAchieved ? 'Tandai belum tercapai' : 'Tandai tercapai'}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(goal)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-navy-900 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Edit tujuan"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(goal)}
            className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Hapus tujuan"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Amounts */}
      <div className="flex items-baseline justify-between mb-2">
        <div>
          <p className="text-xs text-gray-400">Tersimpan</p>
          <p className="text-lg font-bold text-navy-900">
            {formatIDR(Number(goal.current_savings))}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">Target</p>
          <p className="text-sm font-semibold text-gray-600">
            {formatIDR(Number(goal.target_amount))}
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-2">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${metrics.progressPercentage}%`,
            backgroundColor: isAchieved ? '#10b981' : color,
          }}
        />
      </div>
      <div className="flex items-center justify-between text-xs mb-3">
        <span className="text-gray-500">
          {metrics.progressPercentage}% tercapai
        </span>
        <span className={isAchieved ? 'text-emerald-600 font-semibold' : 'text-gray-500'}>
          {isAchieved ? 'Tercapai!' : `Sisa ${formatIDR(metrics.remaining)}`}
        </span>
      </div>

      {/* Required contribution */}
      {!isAchieved && (
        <div
          className={`px-3 py-2.5 rounded-xl mb-3 ${
            metrics.isOverdue ? 'bg-red-50' : 'bg-emerald-50/60'
          }`}
        >
          {metrics.isOverdue ? (
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-700">
                Tenggat terlewat. Sisa {formatIDR(metrics.remaining)} belum tercapai.
              </p>
            </div>
          ) : (
            <>
              <p className="text-xs text-gray-500">Kontribusi bulanan diperlukan</p>
              <p className="text-sm font-bold text-emerald-700 mt-0.5">
                {formatIDR(metrics.requiredMonthlyContribution ?? 0)}
                <span className="text-xs font-medium text-gray-500"> / bulan</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                {metrics.monthsRemaining} bulan tersisa
              </p>
            </>
          )}
        </div>
      )}

      {/* Quick add savings buttons */}
      {!isAchieved && !metrics.isOverdue && (
        <div className="flex items-center gap-2 mb-3">
          <button
            onClick={() => onUpdateSavings(goal, quickAdd)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-xs font-semibold text-gray-600 transition-all duration-200 hover:bg-emerald-50 hover:text-emerald-700"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah 100rb
          </button>
          <button
            onClick={() => onUpdateSavings(goal, -quickAdd)}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-gray-50 text-xs font-semibold text-gray-600 transition-all duration-200 hover:bg-gray-100"
          >
            <Minus className="w-3.5 h-3.5" />
            Kurangi 100rb
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-3 border-t border-gray-100">
        <Calendar className="w-3.5 h-3.5" />
        <span>Tenggat: {formatDateID(goal.deadline)}</span>
      </div>

      {goal.notes && (
        <p className="mt-2 text-xs text-gray-400 italic truncate">{goal.notes}</p>
      )}
    </div>
  );
}
