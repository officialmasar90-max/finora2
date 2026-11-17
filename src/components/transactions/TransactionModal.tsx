import { useState, useEffect, type FormEvent } from 'react';
import { X, Loader2, AlertCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  type TransactionType,
  getCategoriesByType,
  getCategoryConfig,
} from '@/config/categories';
import type { Transaction } from '@/types/transaction';

export interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    type: TransactionType;
    category: string;
    description: string;
    transaction_date: string;
  }) => Promise<{ error: string | null }>;
  editingTransaction?: Transaction | null;
}

function todayISO(): string {
  return new Date().toISOString().split('T')[0];
}

export default function TransactionModal({
  open,
  onClose,
  onSubmit,
  editingTransaction,
}: TransactionModalProps) {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(todayISO());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (editingTransaction) {
        setType(editingTransaction.type);
        setAmount(String(Number(editingTransaction.amount)));
        setCategory(editingTransaction.category);
        setDescription(editingTransaction.description);
        setDate(editingTransaction.transaction_date);
      } else {
        setType('expense');
        setAmount('');
        setCategory('');
        setDescription('');
        setDate(todayISO());
      }
      setError(null);
    }
  }, [open, editingTransaction]);

  // Reset category when type changes
  useEffect(() => {
    const cats = getCategoriesByType(type);
    if (!cats.find((c) => c.label === category)) {
      setCategory('');
    }
  }, [type, category]);

  if (!open) return null;

  const categories = getCategoriesByType(type);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = Number(amount);
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      setError('Jumlah harus lebih besar dari 0.');
      return;
    }
    if (!category) {
      setError('Pilih kategori terlebih dahulu.');
      return;
    }
    if (!description.trim()) {
      setError('Deskripsi tidak boleh kosong.');
      return;
    }
    if (!date) {
      setError('Pilih tanggal transaksi.');
      return;
    }

    setLoading(true);
    const { error: submitError } = await onSubmit({
      amount: parsedAmount,
      type,
      category,
      description: description.trim(),
      transaction_date: date,
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-card-lg max-h-[90vh] overflow-y-auto scrollbar-thin animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-sm px-6 py-4 border-b border-gray-100 flex items-center justify-between z-10">
          <h3 className="text-lg font-bold text-navy-900">
            {editingTransaction ? 'Edit Transaksi' : 'Tambah Transaksi'}
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
          {/* Type toggle */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <ArrowUpRight className="w-4 h-4" />
              Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                type === 'expense'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
              }`}
            >
              <ArrowDownRight className="w-4 h-4" />
              Pengeluaran
            </button>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Jumlah
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                Rp
              </span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                min="1"
                step="1"
                required
                autoFocus
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-navy-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Kategori
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {categories.map((cat) => {
                const Icon = cat.icon;
                const selected = category === cat.label;
                return (
                  <button
                    key={cat.label}
                    type="button"
                    onClick={() => setCategory(cat.label)}
                    className={`flex flex-col items-center gap-1.5 px-2 py-3 rounded-xl border text-xs font-medium transition-all duration-200 ${
                      selected
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" style={{ color: cat.color }} />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Deskripsi
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'income' ? 'cth. Gaji bulan November' : 'cth. Belanja bulanan'}
              required
              maxLength={100}
              className="input-field"
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              Tanggal Transaksi
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              max={todayISO()}
              className="input-field"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Actions */}
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
              {editingTransaction ? 'Simpan Perubahan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Re-export for convenience in parent components
export { getCategoryConfig };
