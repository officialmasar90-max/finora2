import { ChevronDown, Calendar } from 'lucide-react';

interface MonthFilterProps {
  months: { key: string; label: string }[];
  value: string;
  onChange: (key: string) => void;
}

export default function MonthFilter({ months, value, onChange }: MonthFilterProps) {
  return (
    <div className="relative inline-flex items-center">
      <Calendar className="absolute left-3 w-4 h-4 text-gray-400 pointer-events-none z-10" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-9 pr-9 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-navy-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer hover:border-gray-300"
      >
        {months.map((m) => (
          <option key={m.key} value={m.key}>
            {m.label}
          </option>
        ))}
      </select>
      <ChevronDown className="absolute right-3 w-4 h-4 text-gray-400 pointer-events-none" />
    </div>
  );
}
