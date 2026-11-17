import { FileText, Trash2, ChevronRight, Loader2 } from 'lucide-react';
import type { AssessmentRecord } from '@/hooks/useAssessments';
import { formatIDR } from '@/utils/format';

interface AssessmentHistoryProps {
  assessments: AssessmentRecord[];
  loading: boolean;
  onView: (record: AssessmentRecord) => void;
  onDelete: (id: string) => void;
  selectedId?: string;
}

function statusBadge(status: 'good' | 'warning' | 'critical') {
  const config = {
    good: { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Sehat' },
    warning: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Perhatian' },
    critical: { bg: 'bg-red-50', text: 'text-red-700', label: 'Kritis' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  );
}

export default function AssessmentHistory({
  assessments,
  loading,
  onView,
  onDelete,
  selectedId,
}: AssessmentHistoryProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-5 h-5 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (assessments.length === 0) {
    return (
      <div className="card p-8">
        <div className="flex flex-col items-center justify-center text-center py-8">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
            <FileText className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
          </div>
          <p className="text-sm font-semibold text-navy-900">Belum ada riwayat asesmen</p>
          <p className="mt-1 text-sm text-gray-500 max-w-xs">
            Laporan dari asesmen yang Anda simpan akan muncul di sini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {assessments.map((record) => {
        const isSelected = record.id === selectedId;
        const overall = record.report?.report?.overallStatus ?? 'warning';
        const metrics = record.report?.metrics;
        const netCashFlow = metrics?.netCashFlow?.value ?? 0;

        return (
          <div
            key={record.id}
            className={`card p-4 transition-all duration-200 cursor-pointer ${
              isSelected ? 'ring-2 ring-emerald-500 border-emerald-200' : 'hover:shadow-card-hover'
            }`}
            onClick={() => onView(record)}
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-navy-50 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-navy-600" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-navy-900">
                    {new Date(record.created_at).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-400 truncate">
                    Arus kas: {formatIDR(netCashFlow)} · Pendapatan: {formatIDR(Number(record.monthly_income))}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {statusBadge(overall)}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(record.id);
                  }}
                  className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                  aria-label="Hapus asesmen"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
