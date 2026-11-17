import { Search, ChevronDown, X } from 'lucide-react';
import {
  type TransactionType,
  incomeCategories,
  expenseCategories,
} from '@/config/categories';
import type { TransactionFilters } from '@/types/transaction';

interface TransactionFiltersBarProps {
  filters: TransactionFilters;
  onChange: (filters: TransactionFilters) => void;
  resultCount: number;
}

const allCategoryOptions = [...incomeCategories, ...expenseCategories].filter(
  (c, i, arr) => arr.findIndex((x) => x.label === c.label) === i
);

export default function TransactionFiltersBar({
  filters,
  onChange,
  resultCount,
}: TransactionFiltersBarProps) {
  const hasActiveFilters =
    filters.search ||
    filters.type !== 'all' ||
    filters.category !== 'all' ||
    filters.startDate ||
    filters.endDate;

  const reset = () => {
    onChange({
      search: '',
      type: 'all',
      category: 'all',
      startDate: '',
      endDate: '',
    });
  };

  return (
    <div className="card p-4 sm:p-5 space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={filters.search}
          onChange={(e) => onChange({ ...filters, search: e.target.value })}
          placeholder="Cari transaksi berdasarkan deskripsi atau kategori..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-sm text-navy-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 focus:bg-white"
        />
      </div>

      {/* Filter row */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Type */}
        <div className="relative flex-1">
          <select
            value={filters.type}
            onChange={(e) =>
              onChange({ ...filters, type: e.target.value as TransactionType | 'all' })
            }
            className="appearance-none w-full pl-4 pr-9 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-navy-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer hover:border-gray-300"
          >
            <option value="all">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Category */}
        <div className="relative flex-1">
          <select
            value={filters.category}
            onChange={(e) => onChange({ ...filters, category: e.target.value })}
            className="appearance-none w-full pl-4 pr-9 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-navy-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer hover:border-gray-300"
          >
            <option value="all">Semua Kategori</option>
            <optgroup label="Pemasukan">
              {incomeCategories.map((c) => (
                <option key={c.label} value={c.label}>{c.label}</option>
              ))}
            </optgroup>
            <optgroup label="Pengeluaran">
              {expenseCategories.map((c) => (
                <option key={c.label} value={c.label}>{c.label}</option>
              ))}
            </optgroup>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        {/* Start date */}
        <div className="flex-1">
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => onChange({ ...filters, startDate: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-navy-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer hover:border-gray-300"
            aria-label="Dari tanggal"
          />
        </div>

        {/* End date */}
        <div className="flex-1">
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => onChange({ ...filters, endDate: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm font-medium text-navy-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer hover:border-gray-300"
            aria-label="Sampai tanggal"
          />
        </div>
      </div>

      {/* Results + reset */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          <span className="font-semibold text-navy-900">{resultCount}</span> transaksi ditemukan
        </p>
        {hasActiveFilters && (
          <button
            onClick={reset}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-navy-900 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
            Reset Filter
          </button>
        )}
      </div>
    </div>
  );
}
