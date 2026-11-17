import { useState, useMemo, useCallback } from 'react';
import {
  Plus,
  Loader2,
  AlertCircle,
  Inbox,
  CreditCard,
  Calculator,
} from 'lucide-react';
import { useDebts, type Debt } from '@/hooks/useDebts';
import {
  compareStrategies,
  type DebtInput,
} from '@/lib/debtCalculations';
import DebtSummary from '@/components/debt/DebtSummary';
import DebtCard from '@/components/debt/DebtCard';
import DebtModal from '@/components/debt/DebtModal';
import DeleteDebtDialog from '@/components/debt/DeleteDebtDialog';
import StrategyComparisonView from '@/components/debt/StrategyComparisonView';

export default function DebtPage() {
  const { debts, loading, error, addDebt, updateDebt, deleteDebt } = useDebts();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDebt, setEditingDebt] = useState<Debt | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Debt | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);
  const [showStrategy, setShowStrategy] = useState(false);

  const activeDebts = useMemo(() => debts.filter((d) => !d.is_paid_off), [debts]);

  // Prepare debt inputs for strategy calculation
  const debtInputs: DebtInput[] = useMemo(
    () =>
      activeDebts.map((d) => ({
        id: d.id,
        name: d.name,
        principal: Number(d.principal),
        interest_rate: Number(d.interest_rate),
        monthly_installment: Number(d.monthly_installment),
        minimum_payment: Number(d.minimum_payment),
      })),
    [activeDebts]
  );

  // Calculate strategy comparison (memoized — pure deterministic function)
  const comparison = useMemo(() => {
    if (debtInputs.length === 0) return null;
    return compareStrategies(debtInputs, 0);
  }, [debtInputs]);

  const handleAdd = () => {
    setEditingDebt(null);
    setPageError(null);
    setModalOpen(true);
  };

  const handleEdit = (debt: Debt) => {
    setEditingDebt(debt);
    setPageError(null);
    setModalOpen(true);
  };

  const handleModalSubmit = useCallback(
    async (data: {
      name: string;
      principal: number;
      interest_rate: number;
      monthly_installment: number;
      minimum_payment: number;
      due_date: string;
      notes?: string | null;
    }) => {
      if (editingDebt) {
        return updateDebt(editingDebt.id, data);
      }
      return addDebt(data);
    },
    [editingDebt, addDebt, updateDebt]
  );

  const handleTogglePaid = useCallback(
    async (debt: Debt) => {
      const { error: toggleError } = await updateDebt(debt.id, {
        is_paid_off: !debt.is_paid_off,
      });
      if (toggleError) {
        setPageError('Gagal mengubah status utang. Silakan coba lagi.');
      }
    },
    [updateDebt]
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const { error: delError } = await deleteDebt(deleteTarget.id);
    setDeleteLoading(false);
    if (delError) {
      setPageError('Gagal menghapus utang. Silakan coba lagi.');
      return;
    }
    setDeleteTarget(null);
  };

  if (loading && debts.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error && debts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-navy-900">Gagal memuat data utang</p>
        <p className="mt-1 text-sm text-gray-500 max-w-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Manajemen Utang</h2>
          <p className="text-sm text-gray-500 mt-1">
            Catat utang Anda dan bandingkan strategi pelunasan Snowball vs Avalanche
          </p>
        </div>
        <button onClick={handleAdd} className="btn-primary shrink-0 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Tambah Utang
        </button>
      </div>

      {/* Page-level error */}
      {pageError && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{pageError}</p>
        </div>
      )}

      {debts.length === 0 ? (
        <div className="card p-8">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-navy-900">Belum ada utang</p>
            <p className="mt-1 text-sm text-gray-500 max-w-xs">
              Mulai kelola utang Anda dengan mencatat pokok pinjaman, bunga, dan cicilan bulanan.
              Sistem akan menghitung estimasi pelunasan secara otomatis.
            </p>
            <button onClick={handleAdd} className="btn-primary mt-5">
              <Plus className="w-4 h-4" />
              Tambah Utang Pertama
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <DebtSummary debts={debts} />

          {/* Debt cards */}
          <div>
            <h3 className="text-base font-bold text-navy-900 mb-3">Daftar Utang</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {debts.map((debt) => (
                <DebtCard
                  key={debt.id}
                  debt={debt}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                  onTogglePaid={handleTogglePaid}
                />
              ))}
            </div>
          </div>

          {/* Strategy comparison section */}
          {activeDebts.length > 0 && comparison && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
                    <Calculator className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-navy-900">
                      Perbandingan Strategi Pelunasan
                    </h3>
                    <p className="text-xs text-gray-500">
                      Simulasi deterministik berdasarkan data utang Anda
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStrategy((v) => !v)}
                  className="btn-ghost text-xs"
                >
                  {showStrategy ? 'Sembunyikan' : 'Tampilkan'}
                </button>
              </div>

              {showStrategy && (
                <StrategyComparisonView comparison={comparison} />
              )}
            </div>
          )}

          {activeDebts.length === 0 && debts.length > 0 && (
            <div className="card p-6 bg-emerald-50/30">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                  <CreditCard className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-navy-900">Semua utang telah lunas!</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Selamat, tidak ada utang aktif yang perlu dikelola saat ini.
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <DebtModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingDebt={editingDebt}
      />

      {/* Delete confirmation */}
      <DeleteDebtDialog
        open={!!deleteTarget}
        debtName={deleteTarget?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
