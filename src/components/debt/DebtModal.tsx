import { useState, useEffect, type FormEvent } from 'react';
import { X, Loader2, AlertCircle } from 'lucide-react';
import type { Debt } from '@/hooks/useDebts';

export interface DebtModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    principal: number;
    interest_rate: number;
    monthly_installment: number;
    minimum_payment: number;
    due_date: string;
    notes?: string | null;
  }) => Promise<{ error: string | null }>;
  editingDebt?: Debt | null;
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default function DebtModal({
  open,
  onClose,
  onSubmit,
  editingDebt,
}: DebtModalProps) {
  const [name, setName] = useState('');
  const [principal, setPrincipal] = useState('');
  const [interestRate, setInterestRate] = useState('');
  const [monthlyInstallment, setMonthlyInstallment] = useState('');
  const [minimumPayment, setMinimumPayment] = useState('');
  const [dueDate, setDueDate] = useState(todayISO());
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editingDebt) {
        setName(editingDebt.name);
        setPrincipal(String(Number(editingDebt.principal)));
        setInterestRate(String(Number(editingDebt.interest_rate)));
        setMonthlyInstallment(String(Number(editingDebt.monthly_installment)));
        setMinimumPayment(String(Number(editingDebt.minimum_payment)));
        setDueDate(editingDebt.due_date);
        setNotes(editingDebt.notes ?? '');
      } else {
        setName('');
        setPrincipal('');
        setInterestRate('');
        setMonthlyInstallment('');
        setMinimumPayment('');
        setDueDate(todayISO());
        setNotes('');
      }
      setError(null);
    }
  }, [open, editingDebt]);

  if (!open) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nama kreditur/utang tidak boleh kosong.');
      return;
    }
    const p = Number(principal);
    if (!principal || isNaN(p) || p <= 0) {
      setError('Pokok pinjaman harus lebih besar dari 0.');
      return;
    }
    const ir = Number(interestRate);
    if (interestRate === '' || isNaN(ir) || ir < 0) {
      setError('Suku bunga tahunan harus 0 atau lebih besar.');
      return;
    }
    const mi = Number(monthlyInstallment);
    if (!monthlyInstallment || isNaN(mi) || mi <= 0) {
      setError('Cicilan bulanan harus lebih besar dari 0.');
      return;
    }
    const mp = Number(minimumPayment);
    if (minimumPayment === '' || isNaN(mp) || mp < 0) {
      setError('Pembayaran minimum harus 0 atau lebih besar.');
      return;
    }
    if (!dueDate) {
      setError('Pilih tanggal jatuh tempo.');
      return;
    }

    setLoading(true);
    const { error: submitError } = await onSubmit({
      name: name.trim(),
      principal: p,
      interest_rate: ir,
      monthly_installment: mi,
      minimum_payment: mp,
      due_date: dueDate,
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
            {editingDebt ? 'Edit Utang' : 'Tambah Utang'}
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
              Nama Kreditur / Utang
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="cth. Bank BCA KPR, KTA Mandiri"
              required
              maxLength={100}
              className="input-field"
            />
          </div>

          {/* Principal */}
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Pokok Pinjaman (Outstanding)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                Rp
              </span>
              <input
                type="number"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
                placeholder="0"
                min="1"
                step="1"
                required
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-navy-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Interest rate + Due date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Bunga / Tahun (%)
              </label>
              <input
                type="number"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Jatuh Tempo
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="input-field"
              />
            </div>
          </div>

          {/* Installment + Minimum payment */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">
                Cicilan / Bulan
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                  Rp
                </span>
                <input
                  type="number"
                  value={monthlyInstallment}
                  onChange={(e) => setMonthlyInstallment(e.target.value)}
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
                Min. Pembayaran
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">
                  Rp
                </span>
                <input
                  type="number"
                  value={minimumPayment}
                  onChange={(e) => setMinimumPayment(e.target.value)}
                  placeholder="0"
                  min="0"
                  step="1"
                  required
                  className="w-full pl-9 pr-3 py-3 rounded-xl border border-gray-200 text-sm text-navy-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Catatan (opsional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="cth. Cicilan ke-12 dari 36 bulan"
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
              {editingDebt ? 'Simpan Perubahan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
