import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, Target, Bot } from 'lucide-react';
import { formatIDR } from '@/utils/format';

const stats = [
  { label: 'Total Saldo', value: 125_430_000, change: '+12,5%', icon: Wallet, accent: 'from-emerald-500 to-emerald-700' },
  { label: 'Pemasukan', value: 28_500_000, change: '+8,2%', icon: TrendingUp, accent: 'from-navy-700 to-navy-900' },
  { label: 'Pengeluaran', value: 15_320_000, change: '-3,1%', icon: TrendingDown, accent: 'from-gray-600 to-gray-800' },
];

const transactions = [
  { name: 'Gaji Bulanan', category: 'Pemasukan', amount: 25_000_000, type: 'in' },
  { name: 'Belanja Groceries', category: 'Kebutuhan', amount: 850_000, type: 'out' },
  { name: 'Tagihan Listrik', category: 'Tagihan', amount: 432_000, type: 'out' },
  { name: 'Investasi Reksadana', category: 'Investasi', amount: 2_000_000, type: 'out' },
];

const chartMonths = ['Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov'];
const chartIncome = [55, 65, 50, 70, 75, 82];
const chartExpense = [30, 40, 35, 45, 38, 42];

export default function DashboardPreview() {
  return (
    <div className="relative">
      {/* Glow behind card */}
      <div className="absolute inset-x-8 top-8 bottom-0 bg-gradient-to-br from-emerald-200/40 to-navy-200/30 blur-2xl rounded-3xl -z-10" />

      <div className="card shadow-card-lg p-4 sm:p-6">
        {/* Browser bar */}
        <div className="flex items-center gap-2 pb-4 border-b border-gray-100">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-300" />
            <div className="w-3 h-3 rounded-full bg-amber-300" />
            <div className="w-3 h-3 rounded-full bg-emerald-300" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="px-4 py-1.5 rounded-lg bg-gray-50 text-xs text-gray-400 font-medium hidden sm:block">
              app.finora.id/dasbor
            </div>
          </div>
        </div>

        {/* Dashboard content */}
        <div className="pt-5 space-y-5">
          {/* Welcome bar */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-gray-400">Selamat datang kembali</p>
              <p className="text-base sm:text-lg font-bold text-navy-900">Ringkasan Keuangan</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold">
              <Bot className="w-3.5 h-3.5" /> AI Insight Aktif
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.label} className="rounded-xl border border-gray-100 p-4 hover:shadow-card transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.accent} flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" strokeWidth={2} />
                    </div>
                    <span className={`text-[11px] font-semibold px-1.5 py-0.5 rounded ${
                      stat.change.startsWith('+') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-sm sm:text-base font-bold text-navy-900 mt-0.5">{formatIDR(stat.value)}</p>
                </div>
              );
            })}
          </div>

          {/* Chart + transactions */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Chart */}
            <div className="lg:col-span-3 rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-navy-900">Arus Kas Bulanan</p>
                  <p className="text-xs text-gray-400">6 bulan terakhir</p>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="flex items-center gap-1 text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Masuk
                  </span>
                  <span className="flex items-center gap-1 text-gray-500">
                    <span className="w-2.5 h-2.5 rounded-full bg-navy-300" /> Keluar
                  </span>
                </div>
              </div>
              <div className="flex items-end justify-between gap-2 sm:gap-3 h-36">
                {chartMonths.map((month, i) => (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1.5">
                    <div className="w-full flex items-end justify-center gap-1 h-28">
                      <div
                        className="w-1/2 bg-emerald-500 rounded-t-sm hover:bg-emerald-400 transition-colors"
                        style={{ height: `${chartIncome[i]}%` }}
                      />
                      <div
                        className="w-1/2 bg-navy-300 rounded-t-sm hover:bg-navy-400 transition-colors"
                        style={{ height: `${chartExpense[i]}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-gray-500 font-medium">{month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions */}
            <div className="lg:col-span-2 rounded-xl border border-gray-100 p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold text-navy-900">Transaksi Terbaru</p>
                <span className="text-[11px] font-semibold text-emerald-600">Lihat Semua</span>
              </div>
              <div className="space-y-2.5">
                {transactions.map((tx) => (
                  <div key={tx.name} className="flex items-center justify-between gap-2 pb-2.5 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                        tx.type === 'in' ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {tx.type === 'in' ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-navy-900 truncate">{tx.name}</p>
                        <p className="text-[10px] text-gray-400">{tx.category}</p>
                      </div>
                    </div>
                    <p className={`text-xs font-bold shrink-0 ${tx.type === 'in' ? 'text-emerald-600' : 'text-navy-900'}`}>
                      {tx.type === 'in' ? '+' : '-'}{formatIDR(tx.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Goal progress */}
          <div className="rounded-xl border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" />
                <p className="text-sm font-bold text-navy-900">Dana Darurat</p>
              </div>
              <p className="text-xs text-gray-500">{formatIDR(45_000_000)} / {formatIDR(100_000_000)}</p>
            </div>
            <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 w-[45%] transition-all duration-500" />
            </div>
            <p className="mt-2 text-[11px] text-gray-400">45% tercapai — 7 bulan lagi menuju target</p>
          </div>
        </div>
      </div>
    </div>
  );
}
