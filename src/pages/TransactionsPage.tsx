import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, ArrowUpRight, ArrowDownRight, Loader2, AlertCircle, Inbox } from 'lucide-react';
import { formatIDR, formatDateID } from '@/utils/format';
import { getCategoryConfig, type TransactionType } from '@/config/categories';
import type { Transaction, TransactionFilters } from '@/types/transaction';
import { emptyFilters } from '@/types/transaction';
import { useTransactions, filterTransactions } from '@/hooks/useTransactions';
import TransactionModal from '@/components/transactions/TransactionModal';
import TransactionFiltersBar from '@/components/transactions/TransactionFiltersBar';
import DeleteConfirmDialog from '@/components/transactions/DeleteConfirmDialog';

export default function TransactionsPage() {
  const { transactions, loading, error, addTransaction, updateTransaction, deleteTransaction } =
    useTransactions();

  const [filters, setFilters] = useState<TransactionFilters>(emptyFilters);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deleteTx, setDeleteTx] = useState<Transaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [pageError, setPageError] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterTransactions(transactions, filters),
    [transactions, filters]
  );

  const totalIncome = filtered
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = filtered
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Number(t.amount), 0);

  const handleAdd = () => {
    setEditingTx(null);
    setPageError(null);
    setModalOpen(true);
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setPageError(null);
    setModalOpen(true);
  };

  const handleModalSubmit = async (data: {
    amount: number;
    type: TransactionType;
    category: string;
    description: string;
    transaction_date: string;
  }) => {
    if (editingTx) {
      return updateTransaction(editingTx.id, data);
    }
    return addTransaction(data);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTx) return;
    setDeleteLoading(true);
    const { error: delError } = await deleteTransaction(deleteTx.id);
    setDeleteLoading(false);
    if (delError) {
      setPageError('Gagal menghapus transaksi. Silakan coba lagi.');
      return;
    }
    setDeleteTx(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
          <AlertCircle className="w-7 h-7 text-red-500" />
        </div>
        <p className="text-sm font-semibold text-navy-900">Gagal memuat transaksi</p>
        <p className="mt-1 text-sm text-gray-500 max-w-xs">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-navy-900">Transaksi</h2>
          <p className="text-sm text-gray-500 mt-1">
            Catat dan kelola semua pemasukan serta pengeluaran Anda
          </p>
        </div>
        <button
          onClick={handleAdd}
          className="btn-primary shrink-0"
        >
          <Plus className="w-4 h-4" />
          Tambah Transaksi
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Pemasukan</p>
              <p className="text-base font-bold text-emerald-600">{formatIDR(totalIncome)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total Pengeluaran</p>
              <p className="text-base font-bold text-navy-900">{formatIDR(totalExpense)}</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-navy-900 flex items-center justify-center">
              <span className="text-white text-sm font-bold">Rp</span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Selisih</p>
              <p className={`text-base font-bold ${totalIncome - totalExpense >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatIDR(totalIncome - totalExpense)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Page-level error */}
      {pageError && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{pageError}</p>
        </div>
      )}

      {/* Filters */}
      <TransactionFiltersBar
        filters={filters}
        onChange={setFilters}
        resultCount={filtered.length}
      />

      {/* Transaction list */}
      {filtered.length === 0 ? (
        <div className="card p-8">
          <div className="flex flex-col items-center justify-center text-center py-12">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
            </div>
            <p className="text-sm font-semibold text-navy-900">
              {transactions.length === 0 ? 'Belum ada transaksi' : 'Tidak ada transaksi yang cocok'}
            </p>
            <p className="mt-1 text-sm text-gray-500 max-w-xs">
              {transactions.length === 0
                ? 'Mulai catat pemasukan dan pengeluaran Anda dengan menambahkan transaksi pertama.'
                : 'Coba ubah atau reset filter pencarian Anda.'}
            </p>
            {transactions.length === 0 && (
              <button onClick={handleAdd} className="btn-primary mt-5">
                <Plus className="w-4 h-4" />
                Tambah Transaksi Pertama
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Desktop table header */}
          <div className="hidden sm:grid grid-cols-12 gap-4 px-5 py-3 border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-400 uppercase tracking-wider">
            <div className="col-span-5">Deskripsi</div>
            <div className="col-span-2">Kategori</div>
            <div className="col-span-2">Tanggal</div>
            <div className="col-span-2 text-right">Jumlah</div>
            <div className="col-span-1 text-right">Aksi</div>
          </div>

          {/* Rows */}
          <div className="divide-y divide-gray-50">
            {filtered.map((tx) => {
              const cat = getCategoryConfig(tx.category);
              const Icon = cat.icon;
              const isIn = tx.type === 'income';
              return (
                <div
                  key={tx.id}
                  className="grid grid-cols-12 gap-4 px-5 py-3.5 items-center hover:bg-gray-50/50 transition-colors group"
                >
                  {/* Description + icon */}
                  <div className="col-span-12 sm:col-span-5 flex items-center gap-3 min-w-0">
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${cat.color}15` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: cat.color }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-navy-900 truncate">{tx.description}</p>
                      <p className="sm:hidden text-xs text-gray-400">
                        {tx.category} · {formatDateID(tx.transaction_date)}
                      </p>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="hidden sm:block col-span-2">
                    <span className="text-sm text-gray-600">{tx.category}</span>
                  </div>

                  {/* Date */}
                  <div className="hidden sm:block col-span-2">
                    <span className="text-sm text-gray-500">{formatDateID(tx.transaction_date)}</span>
                  </div>

                  {/* Amount */}
                  <div className="col-span-7 sm:col-span-2 text-right">
                    <span
                      className={`inline-flex items-center gap-1 text-sm font-bold ${
                        isIn ? 'text-emerald-600' : 'text-navy-900'
                      }`}
                    >
                      {isIn ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {isIn ? '+' : '-'}{formatIDR(Number(tx.amount))}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-5 sm:col-span-1 flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleEdit(tx)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-navy-900 transition-colors"
                      aria-label="Edit transaksi"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTx(tx)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      aria-label="Hapus transaksi"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Add/Edit modal */}
      <TransactionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
        editingTransaction={editingTx}
      />

      {/* Delete confirmation */}
      <DeleteConfirmDialog
        open={!!deleteTx}
        transactionDescription={deleteTx?.description ?? ''}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTx(null)}
        loading={deleteLoading}
      />
    </div>
  );
}
