import { CreditCard, Target, TrendingUp, CheckCircle2 } from 'lucide-react';
import { formatIDR } from '@/utils/format';
import type { ReportData } from '@/lib/reportAggregation';

interface ReportProgressProps {
  data: ReportData;
}

export default function ReportProgress({ data }: ReportProgressProps) {
  const { debtSnapshot, goalsSnapshot } = data;

  const debtItems = [
    {
      label: 'Utang aktif',
      value: `${debtSnapshot.activeCount} utang`,
    },
    {
      label: 'Total pokok',
      value: formatIDR(debtSnapshot.totalPrincipal),
    },
    {
      label: 'Cicilan bulanan',
      value: formatIDR(debtSnapshot.monthlyInstallments),
    },
  ];

  const goalItems = [
    {
      label: 'Tujuan tercapai',
      value: `${goalsSnapshot.achievedCount} dari ${goalsSnapshot.totalCount}`,
    },
    {
      label: 'Total tersimpan',
      value: formatIDR(goalsSnapshot.totalSaved),
    },
    {
      label: 'Progress keseluruhan',
      value: `${goalsSnapshot.overallProgress}%`,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Debt progress */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-navy-50 flex items-center justify-center">
            <CreditCard className="w-4 h-4 text-navy-700" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-navy-900">Kondisi Utang</h4>
            <p className="text-xs text-gray-400">Kondisi terkini (bukan snapshot periode)</p>
          </div>
        </div>
        <div className="space-y-2">
          {debtItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm px-3 py-2 rounded-xl bg-gray-50/60">
              <span className="text-gray-500">{item.label}</span>
              <span className="font-semibold text-navy-900">{item.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Goals progress */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center">
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-navy-900">Progres Tujuan Keuangan</h4>
            <p className="text-xs text-gray-400">Kondisi terkini (bukan snapshot periode)</p>
          </div>
        </div>
        <div className="space-y-2">
          {goalItems.map((item) => (
            <div key={item.label} className="flex items-center justify-between text-sm px-3 py-2 rounded-xl bg-gray-50/60">
              <span className="text-gray-500">{item.label}</span>
              <span className="font-semibold text-navy-900">{item.value}</span>
            </div>
          ))}
        </div>

        {/* Overall goal progress bar */}
        <div className="px-3 py-2.5 rounded-xl bg-gray-50/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500">Progres total</span>
            <span className="font-semibold text-emerald-600">{goalsSnapshot.overallProgress}%</span>
          </div>
          <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(100, goalsSnapshot.overallProgress)}%` }}
            />
          </div>
          <p className="text-[10px] text-gray-400 mt-1">
            {formatIDR(goalsSnapshot.totalSaved)} dari {formatIDR(goalsSnapshot.totalTarget)}
          </p>
        </div>
      </div>

      {/* Combined footer note */}
      <div className="md:col-span-2 flex items-start gap-2 px-3 py-2 rounded-xl bg-blue-50/60">
        <TrendingUp className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
        <p className="text-xs text-blue-800">
          Data utang dan tujuan mencerminkan kondisi hari ini. Laporan periode lampau tidak
          menyimpan snapshot historis — gunakan fitur Analisis Keuangan untuk penilaian mendalam
          berbasis periode.
        </p>
      </div>
    </div>
  );
}
