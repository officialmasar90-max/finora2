import { useState, type FormEvent } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import type { AssessmentInput } from '@/lib/financialCalculations';

interface AssessmentFormProps {
  onSubmit: (input: AssessmentInput) => void;
  loading: boolean;
  initial?: Partial<AssessmentInput>;
}

interface NumberField {
  key: keyof Omit<AssessmentInput, 'financialDependents'>;
  label: string;
  placeholder: string;
  hint?: string;
}

const rupiahFields: NumberField[] = [
  { key: 'monthlyIncome', label: 'Pendapatan Bulanan', placeholder: 'cth. 10.000.000', hint: 'Total pendapatan rutin per bulan (gaji, bonus, freelance)' },
  { key: 'essentialExpenses', label: 'Pengeluaran Wajib', placeholder: 'cth. 4.500.000', hint: 'Kebutuhan pokok: tempat tinggal, makan, utilitas, transportasi' },
  { key: 'nonEssentialExpenses', label: 'Pengeluaran Non-Wajib', placeholder: 'cth. 2.000.000', hint: 'Pengeluaran gaya hidup: hiburan, belanja non-esensial, makan di luar' },
  { key: 'monthlyInstallments', label: 'Cicilan Bulanan', placeholder: 'cth. 2.000.000', hint: 'Total pembayaran utang per bulan (KPR, kendaraan, kartu kredit)' },
  { key: 'debtBalances', label: 'Total Saldo Utang', placeholder: 'cth. 50.000.000', hint: 'Total sisa utang yang masih harus dilunasi' },
  { key: 'savings', label: 'Total Tabungan', placeholder: 'cth. 30.000.000', hint: 'Saldo tabungan dan investasi saat ini' },
  { key: 'emergencyFund', label: 'Dana Darurat', placeholder: 'cth. 15.000.000', hint: 'Dana yang khusus dialokasikan untuk keadaan darurat' },
];

function formatThousands(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  return Number(digits).toLocaleString('id-ID');
}

function parseAmount(value: string): number {
  const digits = value.replace(/\D/g, '');
  return digits ? Number(digits) : 0;
}

export default function AssessmentForm({ onSubmit, loading, initial }: AssessmentFormProps) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of rupiahFields) {
      const v = initial?.[f.key];
      init[f.key] = v ? formatThousands(String(v)) : '';
    }
    init['financialDependents'] = initial?.financialDependents
      ? String(initial.financialDependents)
      : '0';
    return init;
  });
  const [error, setError] = useState<string | null>(null);

  const setField = (key: string, raw: string) => {
    setValues((prev) => ({ ...prev, [key]: raw }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const monthlyIncome = parseAmount(values.monthlyIncome);
    if (monthlyIncome <= 0) {
      setError('Pendapatan bulanan harus lebih besar dari 0.');
      return;
    }

    const essentialExpenses = parseAmount(values.essentialExpenses);
    const nonEssentialExpenses = parseAmount(values.nonEssentialExpenses);
    const monthlyInstallments = parseAmount(values.monthlyInstallments);
    const debtBalances = parseAmount(values.debtBalances);
    const savings = parseAmount(values.savings);
    const emergencyFund = parseAmount(values.emergencyFund);
    const dependents = Number(values.financialDependents) || 0;

    if (dependents < 0) {
      setError('Jumlah tanggungan tidak boleh negatif.');
      return;
    }

    const totalExpenses = essentialExpenses + nonEssentialExpenses + monthlyInstallments;
    if (totalExpenses > monthlyIncome * 2) {
      setError('Total pengeluaran terlalu tinggi dibanding pendapatan. Periksa kembali input Anda.');
      return;
    }

    onSubmit({
      monthlyIncome,
      essentialExpenses,
      nonEssentialExpenses,
      debtBalances,
      monthlyInstallments,
      savings,
      financialDependents: dependents,
      emergencyFund,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Rupiah fields */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {rupiahFields.map((f) => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">
              {f.label}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                value={values[f.key] ?? ''}
                onChange={(e) => setField(f.key, formatThousands(e.target.value))}
                placeholder={f.placeholder}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-navy-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
            {f.hint && <p className="mt-1 text-xs text-gray-400">{f.hint}</p>}
          </div>
        ))}
      </div>

      {/* Dependents */}
      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1.5">
          Jumlah Tanggungan Finansial
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() =>
              setField(
                'financialDependents',
                String(Math.max(0, (Number(values.financialDependents) || 0) - 1))
              )
            }
            className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 text-navy-900 font-bold text-lg hover:bg-gray-100 transition-colors shrink-0"
          >
            −
          </button>
          <input
            type="number"
            value={values.financialDependents ?? '0'}
            onChange={(e) => setField('financialDependents', e.target.value)}
            min="0"
            className="w-20 text-center px-2 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-navy-900 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
          />
          <button
            type="button"
            onClick={() =>
              setField(
                'financialDependents',
                String((Number(values.financialDependents) || 0) + 1)
              )
            }
            className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-200 text-navy-900 font-bold text-lg hover:bg-gray-100 transition-colors shrink-0"
          >
            +
          </button>
          <p className="text-xs text-gray-400">Jumlah orang yang bergantung secara finansial pada Anda</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
          <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Menganalisis...
          </>
        ) : (
          'Hitung & Buat Laporan'
        )}
      </button>
    </form>
  );
}
