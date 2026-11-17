import { Link } from 'react-router-dom';
import { ArrowUpRight, ArrowDownRight, ArrowRight, Inbox } from 'lucide-react';
import { formatIDR, formatDateID } from '@/utils/format';
import EmptyState from './EmptyState';
import { getCategoryConfig } from '@/config/categories';
import type { Transaction } from '@/types/transaction';

interface RecentTransactionsProps {
  transactions: Transaction[];
  maxItems?: number;
}

export default function RecentTransactions({ transactions, maxItems = 6 }: RecentTransactionsProps) {
  const recent = [...transactions]
    .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
    .slice(0, maxItems);

  if (recent.length === 0) {
    return (
      <EmptyState
        icon={Inbox}
        title="Belum ada transaksi"
        description="Transaksi pada bulan terpilih akan muncul di sini setelah dicatat."
      />
    );
  }

  return (
    <div>
      <div className="space-y-1">
        {recent.map((tx) => {
          const cat = getCategoryConfig(tx.category);
          const Icon = cat.icon;
          const isIn = tx.type === 'income';
          return (
            <div
              key={tx.id}
              className="flex items-center justify-between gap-3 py-2.5 px-2 -mx-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${cat.color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color: cat.color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy-900 truncate">{tx.description}</p>
                  <p className="text-xs text-gray-400">
                    {tx.category} · {formatDateID(tx.transaction_date)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                    isIn ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {isIn ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                </span>
                <p
                  className={`text-sm font-bold ${isIn ? 'text-emerald-600' : 'text-navy-900'}`}
                >
                  {isIn ? '+' : '-'}{formatIDR(Number(tx.amount))}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      <Link
        to="/transactions"
        className="mt-4 flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
      >
        Lihat Semua Transaksi
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
