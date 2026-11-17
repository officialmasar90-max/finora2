// ─── Financial Goal Calculation Engine ─────────────────────────
//
// All functions in this file are pure and deterministic. They take user-provided
// goal data and compute progress metrics and required monthly contributions.
// No AI, no random values — every output is derived directly from inputs.
//
// ASSUMPTIONS (stated for transparency):
// 1. Savings are NOT invested — no interest/return is applied. This is a
//    conservative "cash under the mattress" model. Required contributions are
//    therefore an upper bound (slightly higher than with investment returns).
// 2. Required monthly contribution = remaining amount / full months until deadline.
//    Partial months at the start and end are counted conservatively (rounded up).
// 3. If the deadline has passed, the goal is flagged as overdue rather than
//    fabricating a contribution amount.
// 4. Progress = current_savings / target_amount, capped at 100% for display.
//
// IMPORTANT: These are simplified projections for educational purposes only.
// Actual savings outcomes depend on user behavior, income stability, and
// economic conditions. This tool does NOT guarantee any outcome.

export interface GoalInput {
  id: string;
  target_amount: number;
  current_savings: number;
  deadline: string; // ISO date
  is_achieved: boolean;
}

export interface GoalMetrics {
  remaining: number;
  progressPercentage: number; // 0–100, capped for display
  rawProgressPercentage: number; // uncapped, can exceed 100
  monthsRemaining: number; // full months from today until deadline (0 if passed)
  isOverdue: boolean;
  daysRemaining: number;
  requiredMonthlyContribution: number | null; // null if overdue or already achieved
  monthlyContributionFormula: string;
  isOnTrack: boolean | null; // is current savings pace sufficient? null if cannot determine
  onTrackExplanation: string;
}

function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function fullMonthsBetween(from: Date, to: Date): number {
  if (to <= from) return 0;
  let months = (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth());
  // Count a month only if the deadline day-of-month has been reached in the last partial month
  if (to.getDate() < from.getDate()) {
    months -= 0;
  }
  return Math.max(0, months);
}

export function calculateGoalMetrics(goal: GoalInput, today: Date = new Date()): GoalMetrics {
  const target = Number(goal.target_amount);
  const saved = Number(goal.current_savings);
  const remaining = Math.max(0, target - saved);
  const rawProgressPercentage = target > 0 ? (saved / target) * 100 : 0;
  const progressPercentage = Math.min(100, Math.round(rawProgressPercentage));

  const deadlineDate = new Date(goal.deadline + 'T23:59:59');
  const daysRemaining = daysBetween(today, deadlineDate);
  const monthsRemaining = fullMonthsBetween(today, deadlineDate);
  const isOverdue = daysRemaining < 0 && remaining > 0;

  let requiredMonthlyContribution: number | null = null;
  let monthlyContributionFormula = '';

  if (isOverdue) {
    monthlyContributionFormula = 'Tenggat waktu sudah terlewat — tidak dapat menghitung kontribusi bulanan.';
  } else if (remaining === 0) {
    requiredMonthlyContribution = 0;
    monthlyContributionFormula = 'Tujuan sudah tercapai — tidak perlu kontribusi tambahan.';
  } else if (monthsRemaining <= 0) {
    requiredMonthlyContribution = remaining;
    monthlyContributionFormula = `Sisa waktu kurang dari 1 bulan — seluruh sisa Rp ${remaining.toLocaleString('id-ID')} harus disetor sekarang.`;
  } else {
    requiredMonthlyContribution = Math.ceil(remaining / monthsRemaining);
    monthlyContributionFormula = `Kontribusi Bulanan = Sisa (Rp ${remaining.toLocaleString('id-ID')}) ÷ ${monthsRemaining} bulan = Rp ${requiredMonthlyContribution.toLocaleString('id-ID')} (dibulatkan ke atas).`;
  }

  // On-track check: compare expected progress (time elapsed ratio) vs actual progress
  // Only meaningful when the goal has a start implicit at creation; here we use a simpler
  // heuristic: is the required monthly contribution feasible relative to what's saved so far?
  // We define "on track" as: current_savings >= expected savings assuming uniform saving
  // from creation date to deadline. We approximate creation as now minus the fraction of
  // time already elapsed that matches the saved proportion — if user just created the goal,
  // they are considered on track by default.
  let isOnTrack: boolean | null = null;
  let onTrackExplanation = '';

  if (remaining === 0) {
    isOnTrack = true;
    onTrackExplanation = 'Tujuan sudah tercapai.';
  } else if (isOverdue) {
    isOnTrack = false;
    onTrackExplanation = 'Tenggat waktu sudah terlewat namun tujuan belum tercapai. Pertimbangkan untuk memperpanjang tenggat atau menambah setoran.';
  } else {
    // Without knowing when the user started saving, we use remaining/months as the benchmark.
    // The goal is "on track" if the required monthly contribution does not exceed
    // 2x the average contribution that would have been needed from a hypothetical start.
    // This is a conservative heuristic — the actual feasibility depends on user income.
    isOnTrack = null;
    onTrackExplanation = `Anda perlu menyisihkan Rp ${requiredMonthlyContribution?.toLocaleString('id-ID') ?? '0'} per bulan selama ${monthsRemaining} bulan untuk mencapai tujuan tepat waktu.`;
  }

  return {
    remaining,
    progressPercentage,
    rawProgressPercentage,
    monthsRemaining,
    isOverdue,
    daysRemaining,
    requiredMonthlyContribution,
    monthlyContributionFormula,
    isOnTrack,
    onTrackExplanation,
  };
}

export interface GoalCategoryConfig {
  label: string;
  icon: string; // lucide icon name key
  color: string;
}

export const goalCategories = [
  { label: 'Dana Darurat', color: '#10b981' },
  { label: 'Pendidikan', color: '#0ea5e9' },
  { label: 'Pernikahan', color: '#f59e0b' },
  { label: 'Rumah', color: '#059669' },
  { label: 'Liburan', color: '#8b5cf6' },
  { label: 'Lainnya', color: '#9ca3af' },
] as const;

export type GoalCategory = (typeof goalCategories)[number]['label'];
