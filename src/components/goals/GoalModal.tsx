import { useState, useEffect, type FormEvent } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import type { Goal } from '@/hooks/useGoals';
import { goalCategories } from '@/lib/goalCalculations';

export interface GoalModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    category: string;
    target_amount: number;
    current_savings: number;
    deadline: string;
    notes?: string | null;
  }) => Promise<{ error: string | null }>;
  editingGoal?: Goal | null;
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default function GoalModal({
  open,
  onClose,
  onSubmit,
  editingGoal,
}: GoalModalProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentSavings, setCurrentSavings] = useState('');
  const [deadline, setDeadline] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editingGoal) {
        setName(editingGoal.name);
        setCategory(editingGoal.category);
        setTargetAmount(String(Number(editingGoal.target_amount)));
        setCurrentSavings(String(Number(editingGoal.current_savings)));
        setDeadline(editingGoal.deadline);
        setNotes(editingGoal.notes ?? '');
      } else {
        setName('');
        setCategory('');
        setTargetAmount('');
        setCurrentSavings('');
        setDeadline('');
        setNotes('');
      }
      setError(null);
    }
  }, [open, editingGoal]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nama tujuan tidak boleh kosong.');
      return;
    }
    if (!category) {
      setError('Pilih kategori tujuan terlebih dahulu.');
      return;
    }
    const ta = Number(targetAmount);
    if (!targetAmount || isNaN(ta) || ta <= 0) {
      setError('Target jumlah harus lebih besar dari 0.');
      return;
    }
    const cs = Number(currentSavings);
    if (currentSavings === '' || isNaN(cs) || cs < 0) {
      setError('Tabungan saat ini harus 0 atau lebih besar.');
      return;
    }
    if (cs > ta) {
      setError('Tabungan saat ini tidak boleh melebihi target jumlah.');
      return;
    }
    if (!deadline) {
      setError('Pilih tenggat waktu.');
      return;
    }
    const deadlineDate = new Date(deadline + 'T23:59:59');
    if (deadlineDate <= new Date()) {
      setError('Tenggat waktu harus di masa depan.');
      return;
    }

    setLoading(true);
    const { error: submitError } = await onSubmit({
      name: name.trim(),
      category,
      target_amount: ta,
      current_savings: cs,
      deadline,
      notes: notes.trim() || null,
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
            {editingGoal ? 'Edit Tujuan' : 'Tambah Tujuan Keuangan'}
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
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Nama Tujuan
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth. Dana Darurat 6 Bulan, DP Rumah"
              required
              maxLength={100}
              className="input-field"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Kategori
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {goalCategories.map((cat) => {
                const selected = category === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCategory(cat.label)}
                    className={`px-2 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 ${
                      selected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Target amount + Current savings */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Target Jumlah
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                  Rp
                </span>
                <input
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0"
                  min="1"
                  step="1"
                  required
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 text-sm text-navy-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Tabungan Saat Ini
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                  Rp
                </span>
                <input
                  type="number"
                  value={currentSavings}
                  onChange={(e) => setCurrentSavings(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1"
                  required
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 text-sm text-navy-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Tenggat Waktu
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
              min={todayISO()}
              className="input-field"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Catatan (opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="cth. Target reksa dana syariah, setoran gajian tiap tanggal 5"
              maxLength={200}
              rows={2}
              className="input-field resize-none"
            />
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
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {editingGoal ? 'Simpan Perubahan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
