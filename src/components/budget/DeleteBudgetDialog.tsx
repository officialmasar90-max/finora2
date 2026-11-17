import { X, Loader2, AlertCircle } from 'lucide-react';

interface DeleteBudgetDialogProps {
  open: boolean;
  categoryLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function DeleteBudgetDialog({
  open,
  categoryLabel,
  onConfirm,
  onCancel,
  loading,
}: DeleteBudgetDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy-950/50 backdrop-blur-sm animate-fade-in"
        onClick={onCancel}
      />

      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-card-lg animate-slide-up p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <button
            onClick={onCancel}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-navy-900 transition-colors"
            aria-label="Tutup"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 className="text-base font-bold text-navy-900">Hapus Anggaran</h3>
        <p className="mt-1.5 text-sm text-gray-500">
          Apakah Anda yakin ingin menghapus anggaran untuk kategori{' '}
          <span className="font-semibold text-navy-900">{categoryLabel}</span>?
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="flex gap-3 mt-5">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2.5 rounded-xl bg-gray-50 text-sm font-semibold text-gray-600 transition-all duration-200 hover:bg-gray-100 disabled:opacity-60"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:bg-red-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
