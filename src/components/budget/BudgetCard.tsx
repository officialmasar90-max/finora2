import { Pencil, Trash2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';
import { getCategoryConfig } from '@/config/categories';
import { formatIDR } from '@/utils/format';
import type { Budget } from '@/hooks/useBudgets';

export interface BudgetWithSpending {
  budget: Budget;
  spent: number;
  remaining: number;
  percentage: number;
}

interface BudgetCardProps {
  item: BudgetWithSpending;
  onEdit: (budget: Budget) => void;
  onDelete: (budget: Budget) => void;
}

function getWarningLevel(percentage: number): 'safe' | 'warning' | 'danger' {
  if (percentage >= 100) return 'danger';
  if (percentage >= 80) return 'warning';
  return 'safe';
}

const warningConfig = {
  safe: {
    barColor: 'bg-emerald-500',
    icon: CheckCircle2,
    iconColor: 'text-emerald-600',
    badge: null as string | null,
    badgeClass: '',
  },
  warning: {
    barColor: 'bg-amber-500',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
    badge: 'Mendekati batas',
    badgeClass: 'bg-amber-50 text-amber-700',
  },
  danger: {
    barColor: 'bg-red-500',
    icon: AlertTriangle,
    iconColor: 'text-red-600',
    badge: 'Melebihi batas',
    badgeClass: 'bg-red-50 text-red-700',
  },
};

export default function BudgetCard({ item, onEdit, onDelete }: BudgetCardProps) {
  const { budget, spent, remaining, percentage } = item;
  const cat = getCategoryConfig(budget.category);
  const Icon: LucideIcon = cat.icon;
  const level = getWarningLevel(percentage);
  const cfg = warningConfig[level];
  const WarningIcon = cfg.icon;
  const barWidth = Math.min(percentage, 100);
  const isOver = percentage >= 100;

  return (
    <div className="card card-hover p-4 sm:p-5 group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ backgroundColor: `${cat.color}15` }}
          >
            <Icon className="w-5 h-5" style={{ color: cat.color }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-navy-900 truncate">{budget.category}</p>
            <p className="text-xs text-gray-400">
              Limit {formatIDR(Number(budget.limit_amount))}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onEdit(budget)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-navy-900 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Edit anggaran"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(budget)}
            className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Hapus anggaran"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            Terpakai <span className="font-semibold text-navy-900">{formatIDR(spent)}</span>
          </span>
          <span className={`font-semibold ${isOver ? 'text-red-600' : 'text-emerald-600'}`}>
            {percentage}%
          </span>
        </div>

        <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${cfg.barColor}`}
            style={{ width: `${barWidth}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className={isOver ? 'text-red-600 font-semibold' : 'text-gray-500'}>
            {isOver
              ? `Lebih ${formatIDR(Math.abs(remaining))}`
              : `Sisa ${formatIDR(remaining)}`}
          </span>
          {cfg.badge && (
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${cfg.badgeClass}`}>
              <WarningIcon className="w-3 h-3" />
              {cfg.badge}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
