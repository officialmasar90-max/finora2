import { useState, useCallback } from 'react';
import { Plus, Loader2, AlertCircle, Inbox, Info } from 'lucide-react';
import { useGoals, type Goal } from '@/hooks/useGoals';
import GoalsSummary from '@/components/goals/GoalsSummary';
import GoalCard from '@/components/goals/GoalCard';
import GoalModal from '@/components/goals/GoalModal';
import DeleteGoalDialog from '@/components/goals/DeleteGoalDialog';

export default function GoalsPage() {
  const { goals, loading, error, addGoal, updateGoal, deleteGoal } = useGoals();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Goal | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const handleAdd = () => {
    setEditingGoal(null);
    setPageError(null);
    setModalOpen(true);
  };

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setPageError(null);
    setModalOpen(true);
  };

  const handleModalSubmit = useCallback(
    async (data: {
      name: string;
      category: string;
      target_amount: number;
      current_savings: number;
      deadline: string;
      notes?: string | null;
    }) => {
      if (editingGoal) {
        return updateGoal(editingGoal.id, data);
      }
      return addGoal(data);
    },
    [editingGoal, addGoal, updateGoal]
  );

  const handleUpdateSavings = useCallback(
    async (goal: Goal, delta: number) => {
      const current = Number(goal.current_savings);
      const next = Math.max(0, current + delta);
      // Never exceed the target via quick-add buttons
      const capped = Math.min(next, Number(goal.target_amount));
      if (capped === current) return;

      const { error: updateError } = await updateGoal(goal.id, {
        current_savings: capped,
      });
      if (updateError) {
        setPageError('Gagal memperbarui tabungan. Silakan coba lagi.');
      }
    },
    [updateGoal]
  );

  const handleToggleAchieved = useCallback(
    async (goal: Goal) => {
      const { error: toggleError } = await updateGoal(goal.id, {
        is_achieved: !goal.is_achieved,
      });
      if (toggleError) {
        setPageError('Gagal mengubah status tujuan. Silakan coba lagi.');
      }
    },
    [updateGoal]
  );

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    const { error: delError } = await deleteGoal(deleteTarget.id);
    setDeleteLoading(false);
    if (delError) {
      setPageError('Gagal menghapus tujuan. Silakan coba lagi.');
      return;
    }
    setDeleteTarget(null);
  };

  if (loading && goals.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error && goals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-navy-900">Gagal memuat data tujuan</p>
        <p className="mt-1 text-sm text-gray-500 max-w-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Tujuan Keuangan</h2>
          <p className="text-sm text-gray-500 mt-1">
            Tetapkan target tabungan dan pantau progres pencapaian Anda
          </p>
        </div>
        <button onClick={handleAdd} className="btn-primary shrink-0 self-start sm:self-auto">
          <Plus className="w-4 h-4" />
          Tambah Tujuan
        </button>
      </div>

      {/* Page-level error */}
      {pageError && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{pageError}</p>
        </div>
      )}

      {/* Educational note about calculation assumptions */}
      <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-blue-50/60 border border-blue-100">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          Kontribusi bulanan dihitung dari: (Target − Tabungan Saat Ini) ÷ sisa bulan hingga
          tenggat. Perhitungan ini tidak memperhitungkan bunga atau imbal hasil investasi,
          sehingga bersifat konservatif. Estimasi untuk tujuan edukasi — bukan jaminan hasil.
        </p>
      </div>

      {goals.length === 0 ? (
        <div className="card p-8">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-navy-900">Belum ada tujuan keuangan</p>
            <p className="mt-1 text-sm text-gray-500 max-w-xs">
              Mulai rencanakan masa depan finansial Anda — dari dana darurat hingga liburan
              impian. Sistem akan menghitung kontribusi bulanan yang diperlukan secara otomatis.
            </p>
            <button onClick={handleAdd} className="btn-primary mt-5">
              <Plus className="w-4 h-4" />
              Tambah Tujuan Pertama
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <GoalsSummary goals={goals} />

          {/* Goal cards */}
          <div>
            <h3 className="text-base font-bold text-navy-900 mb-3">Daftar Tujuan</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {goals.map((goal) => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onEdit={handleEdit}
                  onDelete={setDeleteTarget}
                  onUpdateSavings={handleUpdateSavings}
                  onToggleAchieved={handleToggleAchieved}
                />
              ))}
            </div>
          </div>
        </>
      )}

      {/* Modal */}
      <GoalModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingGoal={editingGoal}
      />

      {/* Delete confirmation */}
      <DeleteGoalDialog
        open={!!deleteTarget}
        goalName={deleteTarget?.name ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
