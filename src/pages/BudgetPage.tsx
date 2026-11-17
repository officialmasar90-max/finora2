import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Loader2,
  AlertCircle,
  Inbox,
  Wallet,
  Pencil,
} from 'lucide-react';
import { useBudgets, type Budget } from '@/hooks/useBudgets';
import { useTransactions } from '@/hooks/useTransactions';
import { getMonthKey, formatMonthLabel } from '@/types/transaction';
import { getAvailableMonths } from '@/hooks/useTransactions';
import { getCategoryBreakdown } from '@/hooks/useTransactions';
import { getCategoryConfig, expenseCategories } from '@/config/categories';
import { formatIDR } from '@/utils/format';
import MonthFilter from '@/components/dashboard/MonthFilter';
import BudgetSummary from '@/components/budget/BudgetSummary';
import BudgetCard, { type BudgetWithSpending } from '@/components/budget/BudgetCard';
import BudgetModal from '@/components/budget/BudgetModal';
import DeleteBudgetDialog from '@/components/budget/DeleteBudgetDialog';

export default function BudgetPage() {
  const now = new Date();
  const currentMonth = getMonthKey(now);

  const { transactions, loading: txLoading, error: txError } = useTransactions();
  const availableMonths = useMemo(
    () => getAvailableMonths(transactions),
    [transactions]
  );

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const effectiveMonth = availableMonths.find((m) => m.key === selectedMonth)
    ? selectedMonth
    : currentMonth;

  const { budgets, loading, error, addBudget, updateBudget, deleteBudget } =
    useBudgets(effectiveMonth);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Budget | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  // Category colors map for breakdown
  const categoryColors = useMemo(() => {
    const map: Record<string, string> = {};
    for (const cat of expenseCategories) {
      map[cat.label] = cat.color;
    }
    return map;
  }, []);

  // Actual spending per category for the selected month
  const spendingByCategory = useMemo(() => {
    const breakdown = getCategoryBreakdown(transactions, effectiveMonth, categoryColors);
    const map = new Map<string, number>();
    for (const item of breakdown) {
      map.set(item.category, item.amount);
    }
    return map;
  }, [transactions, effectiveMonth, categoryColors]);

  // Merge budgets with spending data
  const budgetItems: BudgetWithSpending[] = useMemo(() => {
    return budgets.map((budget) => {
      const spent = spendingByCategory.get(budget.category) ?? 0;
      const limit = Number(budget.limit_amount);
      const remaining = limit - spent;
      const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
      return { budget, spent, remaining, percentage };
    });
  }, [budgets, spendingByCategory]);

  // Summary calculations
  const summary = useMemo(() => {
    const totalBudget = budgetItems.reduce((s, b) => s + Number(b.budget.limit_amount), 0);
    const totalSpent = budgetItems.reduce((s, b) => s + b.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    const warningCount = budgetItems.filter((b) => b.percentage >= 80).length;
    return { totalBudget, totalSpent, totalRemaining, warningCount };
  }, [budgetItems]);

  const existingCategories = useMemo(
    () => budgets.map((b) => b.category),
    [budgets]
  );

  const handleAdd = () => {
    setEditingBudget(null);
    setPageError(null);
    setModalOpen(true);
  };

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget);
    setPageError(null);
    setModalOpen(true);
  };

  const handleModalSubmit = useCallback(
    async (data: { category: string; limit_amount: number }) => {
      if (editingBudget) {
        return updateBudget(editingBudget.id, {
          category: data.category,
          limit_amount: data.limit_amount,
        });
      }
      return addBudget({
        category: data.category,
        month: effectiveMonth,
        limit_amount: data.limit_amount,
      });
    },
    [editingBudget, effectiveMonth, addBudget, updateBudget]
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const { error: delError } = await deleteBudget(deleteTarget.id);
    setDeleteLoading(false);
    if (delError) {
      setPageError('Gagal menghapus anggaran. Silakan coba lagi.');
      return;
    }
    setDeleteTarget(null);
  };

  const isLoading = loading || txLoading;
  const hasError = error || txError;

  if (isLoading && budgets.length === 0 && transactions.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (hasError && budgets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-navy-900">Gagal memuat data anggaran</p>
        <p className="mt-1 text-sm text-gray-500 max-w-xs">{hasError}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with month filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Perencana Anggaran</h2>
          <p className="text-sm text-gray-500 mt-1">
            Atur batas pengeluaran per kategori dan lacak progresnya setiap bulan
          </p>
        </div>
        <div className="flex items-center gap-3">
          <MonthFilter
            months={availableMonths}
            value={effectiveMonth}
            onChange={setSelectedMonth}
          />
          <button onClick={handleAdd} className="btn-primary shrink-0">
            <Plus className="w-4 h-4" />
            Tambah Anggaran
          </button>
        </div>
      </div>

      {/* Month label */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Wallet className="w-4 h-4 text-emerald-600" />
        <span>
          Anggaran untuk bulan{' '}
          <span className="font-semibold text-navy-900">
            {formatMonthLabel(effectiveMonth)}
          </span>
        </span>
      </div>

      {/* Page-level error */}
      {pageError && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{pageError}</p>
        </div>
      )}

      {/* Summary cards */}
      {budgetItems.length > 0 && (
        <BudgetSummary
          totalBudget={summary.totalBudget}
          totalSpent={summary.totalSpent}
          totalRemaining={summary.totalRemaining}
          budgetCount={budgetItems.length}
          warningCount={summary.warningCount}
        />
      )}

      {/* Budget list */}
      {budgetItems.length === 0 ? (
        <div className="card p-8">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-navy-900">Belum ada anggaran</p>
            <p className="mt-1 text-sm text-gray-500 max-w-xs">
              Mulai kelola pengeluaran Anda dengan menambahkan anggaran per kategori untuk bulan ini.
            </p>
            <button onClick={handleAdd} className="btn-primary mt-5">
              <Plus className="w-4 h-4" />
              Tambah Anggaran Pertama
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgetItems.map((item) => (
            <BudgetCard
              key={item.budget.id}
              item={item}
              onEdit={handleEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Unbudgeted spending — categories with transactions but no budget */}
      {budgetItems.length > 0 && (() => {
        const unbudgetedSpent = Array.from(spendingByCategory.entries())
          .filter(([cat]) => !existingCategories.includes(cat))
          .sort((a, b) => b[1] - a[1]);

        if (unbudgetedSpent.length === 0) return null;

        const totalUnbudgeted = unbudgetedSpent.reduce((s, [, amt]) => s + amt, 0);

        return (
          <div className="card p-5 sm:p-6">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-navy-900">Pengeluaran Tanpa Anggaran</h3>
                <p className="text-xs text-gray-500">
                  Kategori dengan pengeluaran tapi belum dianggarkan bulan ini
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-sm text-gray-500">
                {unbudgetedSpent.length} kategori · Total {formatIDR(totalUnbudgeted)}
              </span>
            </div>

            <div className="space-y-2">
              {unbudgetedSpent.map(([cat, amount]) => {
                const catConfig = getCategoryConfig(cat);
                const Icon = catConfig.icon;
                return (
                  <div
                    key={cat}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${catConfig.color}15` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: catConfig.color }} />
                      </div>
                      <span className="text-sm font-medium text-navy-900">{cat}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-navy-900">
                        {formatIDR(amount)}
                      </span>
                      <button
                        onClick={() => {
                          setEditingBudget(null);
                          setPageError(null);
                          setModalOpen(true);
                        }}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                        aria-label="Tambah anggaran untuk kategori ini"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Modal */}
      <BudgetModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingBudget={editingBudget}
        existingCategories={existingCategories}
      />

      {/* Delete confirmation */}
      <DeleteBudgetDialog
        open={!!deleteTarget}
        categoryLabel={deleteTarget?.category ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
