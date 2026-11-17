import type { LucideIcon } from 'lucide-react';
import { Sparkles } from 'lucide-react';

interface PagePlaceholderProps {
  icon: LucideIcon;
  title: string;
  description: string;
  badge?: string;
}

export default function PagePlaceholder({
  icon: Icon,
  title,
  description,
  badge,
}: PagePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-emerald-200/40 blur-2xl rounded-full" />
        <div className="relative w-20 h-20 rounded-3xl bg-gradient-to-br from-navy-900 to-navy-700 flex items-center justify-center shadow-card-lg">
          <Icon className="w-9 h-9 text-emerald-400" strokeWidth={1.8} />
        </div>
      </div>

      {badge && (
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          {badge}
        </span>
      )}

      <h2 className="text-2xl sm:text-3xl font-bold text-navy-900 mb-3">{title}</h2>
      <p className="max-w-md text-gray-500 leading-relaxed">{description}</p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <button className="btn-primary" disabled>
          Segera Hadir
        </button>
        <button className="btn-ghost" disabled>
          Pelajari Lebih Lanjut
        </button>
      </div>

      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="card card-hover p-5 text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
              <div className="w-5 h-5 rounded-md bg-emerald-200" />
            </div>
            <div className="h-3 w-3/4 rounded-full bg-gray-200 mb-2" />
            <div className="h-2 w-full rounded-full bg-gray-100" />
            <div className="h-2 w-5/6 rounded-full bg-gray-100 mt-1.5" />
          </div>
        ))}
      </div>
    </div>
  );
}
