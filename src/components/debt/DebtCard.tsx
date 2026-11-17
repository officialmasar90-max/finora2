import { Pencil, Trash2, Calendar, Percent, CheckCircle2, CreditCard } from 'lucide-react';
import { formatIDR, formatDateID } from '@/utils/format';
import type { Debt } from '@/hooks/useDebts';

interface DebtCardProps {
  debt: Debt;
  onEdit: (debt: Debt) => void;
  onDelete: (debt: Debt) => void;
  onTogglePaid: (debt: Debt) => void;
}

export default function DebtCard({ debt, onEdit, onDelete, onTogglePaid }: DebtCardProps) {
  const isPaidOff = debt.is_paid_off;
  const principal = Number(debt.principal);
  const rate = Number(debt.interest_rate);
  const installment = Number(debt.monthly_installment);
  const minimum = Number(debt.minimum_payment);

  // Monthly interest estimate for display
  const monthlyInterest = principal * (rate / 100 / 12);

  return (
    <div className={`card card-hover p-4 sm:p-5 group ${isPaidOff ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              isPaidOff ? 'bg-emerald-50' : 'bg-navy-50'
            }`}
          >
            {isPaidOff ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            ) : (
              <CreditCard className="w-5 h-5 text-navy-700" />
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-navy-900 truncate">{debt.name}</p>
            <p className="text-xs text-gray-400">
              {isPaidOff ? 'Lunas' : 'Aktif'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onTogglePaid(debt)}
            className={`p-2 rounded-lg transition-colors opacity-0 group-hover:opacity-100 ${
              isPaidOff
                ? 'text-gray-400 hover:bg-gray-100 hover:text-navy-900'
                : 'text-gray-400 hover:bg-emerald-50 hover:text-emerald-600'
            }`}
            aria-label={isPaidOff ? 'Tandai belum lunas' : 'Tandai lunas'}
            title={isPaidOff ? 'Tandai belum lunas' : 'Tandai lunas'}
          >
            <CheckCircle2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onEdit(debt)}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-navy-900 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Edit utang"
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(debt)}
            className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            aria-label="Hapus utang"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Principal + Interest */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="px-3 py-2.5 rounded-xl bg-gray-50/60">
          <p className="text-xs text-gray-400">Pokok Pinjaman</p>
          <p className="text-sm font-bold text-navy-900 mt-0.5">{formatIDR(principal)}</p>
        </div>
        <div className="px-3 py-2.5 rounded-xl bg-gray-50/60">
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Percent className="w-3 h-3" /> Bunga / Tahun
          </p>
          <p className="text-sm font-bold text-navy-900 mt-0.5">{rate}%</p>
        </div>
      </div>

      {/* Installment + Minimum */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <p className="text-xs text-gray-400">Cicilan / Bulan</p>
          <p className="text-sm font-semibold text-navy-900">{formatIDR(installment)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Min. Pembayaran</p>
          <p className="text-sm font-semibold text-navy-900">{formatIDR(minimum)}</p>
        </div>
      </div>

      {/* Footer: due date + monthly interest estimate */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>Jatuh tempo: {formatDateID(debt.due_date)}</span>
        </div>
        {!isPaidOff && (
          <span className="text-xs text-gray-400">
            ±{formatIDR(Math.round(monthlyInterest))} bunga/bln
          </span>
        )}
      </div>

      {debt.notes && (
        <p className="mt-2 text-xs text-gray-400 italic truncate">{debt.notes}</p>
      )}
    </div>
  );
}
