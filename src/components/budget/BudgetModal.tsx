import { useState, useEffect, type FormEvent } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import { expenseCategories, getCategoryConfig } from '@/config/categories';
import type { Budget } from '@/hooks/useBudgets';

export interface BudgetModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: { category: string; limit_amount: number }) => Promise<{ error: string | null }>;
  editingBudget?: Budget | null;
  existingCategories?: string[];
}

export default function BudgetModal({
  open,
  onClose,
  onSubmit,
  editingBudget,
  existingCategories = [],
}: BudgetModalProps) {
  const [category, setCategory] = useState('');
  const [limitAmount, setLimitAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editingBudget) {
        setCategory(editingBudget.category);
        setLimitAmount(String(Number(editingBudget.limit_amount)));
      } else {
        setCategory('');
        setLimitAmount('');
      }
      setError(null);
    }
  }, [open, editingBudget]);

  if (!open) return null;

  const availableCategories = editingBudget
    ? expenseCategories
    : expenseCategories.filter((c) => !existingCategories.includes(c.label));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!category) {
      setError('Pilih kategori terlebih dahulu.');
      return;
    }
    const parsed = Number(limitAmount);
    if (!limitAmount || isNaN(parsed) || parsed <= 0) {
      setError('Batas anggaran harus lebih besar dari 0.');
      return;
    }

    setLoading(true);
    const { error: submitError } = await onSubmit({
      category,
      limit_amount: parsed,
    });
    setLoading(false);

    if (submitError) {
      setError(submitError);
      return;
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-card-lg max-h-[90vh] overflow-y-auto scrollbar-thin animate-slide-up">
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-navy-900">
            {editingBudget ? 'Edit Anggaran' : 'Tambah Anggaran'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-navy-900 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Kategori Pengeluaran
            </label>
            {availableCategories.length === 0 && !editingBudget ? (
              <p className="text-sm text-gray-500 px-4 py-3 rounded-xl bg-gray-50">
                Semua kategori sudah memiliki anggaran untuk bulan ini.
              </p>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {availableCategories.map((cat) => {
                  const Icon = cat.icon;
                  const selected = category === cat.label;
                  return (
                    <button
                      key={cat.label}
                      type="button"
                      onClick={() => setCategory(cat.label)}
                      disabled={!!editingBudget}
                      className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-xs font-medium transition-all duration-200 ${
                        selected
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      } ${editingBudget ? 'opacity-60 cursor-not-allowed' : ''}`}
                    >
                      <Icon className="w-4 h-4" style={{ color: cat.color }} />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Batas Anggaran
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                Rp
              </span>
              <input
                type="number"
                value={limitAmount}
                onChange={(e) => setLimitAmount(e.target.value)}
                placeholder="0"
                min="1"
                step="1"
                required
                autoFocus
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-navy-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl bg-gray-50 text-sm font-semibold text-gray-600 transition-all duration-200 hover:bg-gray-100"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading || (availableCategories.length === 0 && !editingBudget)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingBudget ? 'Simpan Perubahan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export { getCategoryConfig };
