import { FileBarChart } from 'lucide-react';

interface ReportPeriodSelectorProps {
  type: 'monthly' | 'yearly';
  onTypeChange: (type: 'monthly' | 'yearly') => void;
  periods: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
  disabled?: boolean;
}

export default function ReportPeriodSelector({
  type,
  onTypeChange,
  periods,
  value,
  onChange,
  disabled,
}: ReportPeriodSelectorProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
      {/* Type toggle */}
      <div className="inline-flex rounded-xl bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => onTypeChange('monthly')}
          disabled={disabled}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            type === 'monthly'
              ? 'bg-white text-navy-900 shadow-sm'
              : 'text-gray-500 hover:text-navy-900'
          }`}
        >
          Bulanan
        </button>
        <button
          type="button"
          onClick={() => onTypeChange('yearly')}
          disabled={disabled}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
            type === 'yearly'
              ? 'bg-white text-navy-900 shadow-sm'
              : 'text-gray-500 hover:text-navy-900'
          }`}
        >
          Tahunan
        </button>
      </div>

      {/* Period dropdown */}
      <div className="relative inline-flex items-center">
        <FileBarChart className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none z-10" />
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="appearance-none pl-9 pr-9 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-navy-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer hover:border-gray-300 disabled:opacity-60"
        >
          {periods.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
        <svg
          className="absolute right-3 w-4 h-4 text-gray-400 pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
}
