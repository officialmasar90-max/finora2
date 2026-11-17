// ─── Financial Assessment Calculation Engine ───────────────────
//
// All functions in this file are pure and deterministic. They take user-provided
// numeric inputs and return computed metrics. No AI, no random values, no
// assumptions about missing data — every output is derived directly from inputs.
//
// All monetary values are in Indonesian Rupiah (IDR). Ratios are expressed as
// percentages (0–100). Every formula is documented inline.

export interface AssessmentInput {
  monthlyIncome: number;
  essentialExpenses: number;
  nonEssentialExpenses: number;
  debtBalances: number;
  monthlyInstallments: number;
  savings: number;
  financialDependents: number;
  emergencyFund: number;
}

export interface RatioResult {
  value: number; // the computed percentage or ratio
  label: string; // Indonesian label
  formula: string; // human-readable formula explanation
  interpretation: string; // what the value means in context
  status: 'good' | 'warning' | 'critical';
}

export interface AssessmentMetrics {
  netCashFlow: {
    value: number;
    formula: string;
    interpretation: string;
    status: 'good' | 'warning' | 'critical';
  };
  savingsRatio: RatioResult;
  debtToIncomeRatio: RatioResult;
  essentialExpenseRatio: RatioResult;
  nonEssentialExpenseRatio: RatioResult;
  totalExpenseRatio: RatioResult;
  emergencyFundCoverage: RatioResult;
  // Derived totals used by the report generator
  totalExpenses: number;
  totalDebtPayments: number;
}

// Helper: clamp a percentage to 0–100 and round to nearest integer
function pct(n: number): number {
  return Math.max(0, Math.round(n));
}

// Helper: round to 1 decimal place
function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

/**
 * Calculate monthly net cash flow.
 * Formula: Net Cash Flow = Monthly Income − Essential Expenses − Non-Essential Expenses − Monthly Installments
 * A positive value means the user has surplus money after all obligations.
 */
export function calculateNetCashFlow(input: AssessmentInput): {
  value: number;
  formula: string;
  interpretation: string;
  status: 'good' | 'warning' | 'critical';
} {
  const totalExpenses =
    input.essentialExpenses + input.nonEssentialExpenses + input.monthlyInstallments;
  const value = input.monthlyIncome - totalExpenses;

  let status: 'good' | 'warning' | 'critical';
  if (value > 0) status = 'good';
  else if (value === 0) status = 'warning';
  else status = 'critical';

  const interpretation =
    value > 0
      ? `Arus kas positif — Anda memiliki surplus Rp ${value.toLocaleString('id-ID')} setiap bulan setelah semua kewajiban.`
      : value === 0
        ? 'Arus kas nol — pendapatan Anda habis tepat untuk semua kewajiban. Tidak ada ruang untuk tabungan tambahan.'
        : `Arus kas negatif — pengeluaran Anda melebihi pendapatan sebesar Rp ${Math.abs(value).toLocaleString('id-ID')} per bulan.`;

  return {
    value,
    formula:
      'Arus Kas Bersih = Pendapatan Bulanan − Pengeluaran Wajib − Pengeluaran Non-Wajib − Cicilan Bulanan',
    interpretation,
    status,
  };
}

/**
 * Calculate savings ratio.
 * Formula: Savings Ratio = ((Income − Essential − Non-Essential − Installments) / Income) × 100
 * This is the percentage of income left after all spending and debt payments.
 * General benchmark: ≥ 20% is healthy, 10–20% is fair, < 10% is concerning.
 */
export function calculateSavingsRatio(input: AssessmentInput): RatioResult {
  const totalExpenses =
    input.essentialExpenses + input.nonEssentialExpenses + input.monthlyInstallments;
  const netCashFlow = input.monthlyIncome - totalExpenses;
  const ratio = input.monthlyIncome > 0 ? (netCashFlow / input.monthlyIncome) * 100 : 0;

  let status: 'good' | 'warning' | 'critical';
  let interpretation: string;
  if (ratio >= 20) {
    status = 'good';
    interpretation = `Rasio tabungan ${pct(ratio)}% — sehat. Anda menyisihkan minimal 20% dari pendapatan, sesuai anjuran ahli keuangan.`;
  } else if (ratio >= 10) {
    status = 'warning';
    interpretation = `Rasio tabungan ${pct(ratio)}% — cukup. Idealnya ≥ 20%, namun Anda sudah menabung sebagian dari pendapatan.`;
  } else if (ratio >= 0) {
    status = 'critical';
    interpretation = `Rasio tabungan ${pct(ratio)}% — rendah. Hampir semua pendapatan terpakai untuk pengeluaran dan cicilan.`;
  } else {
    status = 'critical';
    interpretation = `Rasio tabungan ${pct(ratio)}% — negatif. Pengeluaran melebihi pendapatan, tidak ada sisa untuk ditabung.`;
  }

  return {
    value: pct(ratio),
    label: 'Rasio Tabungan',
    formula:
      'Rasio Tabungan = ((Pendapatan − Total Pengeluaran − Cicilan) / Pendapatan) × 100%',
    interpretation,
    status,
  };
}

/**
 * Calculate debt-to-income ratio.
 * Formula: DTI = (Monthly Installments / Monthly Income) × 100
 * Measures what portion of income goes to debt repayment.
 * General benchmark: ≤ 30% is healthy, 30–43% is warning, > 43% is critical.
 */
export function calculateDebtToIncomeRatio(input: AssessmentInput): RatioResult {
  const ratio =
    input.monthlyIncome > 0 ? (input.monthlyInstallments / input.monthlyIncome) * 100 : 0;

  let status: 'good' | 'warning' | 'critical';
  let interpretation: string;
  if (input.monthlyInstallments === 0) {
    status = 'good';
    interpretation = 'Tidak ada cicilan bulanan — rasio utang terhadap pendapatan adalah 0%.';
  } else if (ratio <= 30) {
    status = 'good';
    interpretation = `Rasio DTI ${pct(ratio)}% — sehat. Cicilan Anda ≤ 30% dari pendapatan, masih dalam batas aman.`;
  } else if (ratio <= 43) {
    status = 'warning';
    interpretation = `Rasio DTI ${pct(ratio)}% — perlu perhatian. Berada di zona 30–43%, batas maksimum yang umum diterima pemberi pinjaman.`;
  } else {
    status = 'critical';
    interpretation = `Rasio DTI ${pct(ratio)}% — tinggi. Cicilan melebihi 43% dari pendapatan, berisiko bagi stabilitas keuangan.`;
  }

  return {
    value: pct(ratio),
    label: 'Rasio Utang terhadap Pendapatan (DTI)',
    formula: 'Rasio DTI = (Cicilan Bulanan / Pendapatan Bulanan) × 100%',
    interpretation,
    status,
  };
}

/**
 * Calculate essential expense ratio.
 * Formula: Essential Ratio = (Essential Expenses / Monthly Income) × 100
 * Measures the proportion of income spent on necessities.
 * General benchmark: ≤ 50% is healthy, 50–60% is fair, > 60% is concerning.
 */
export function calculateEssentialExpenseRatio(input: AssessmentInput): RatioResult {
  const ratio =
    input.monthlyIncome > 0 ? (input.essentialExpenses / input.monthlyIncome) * 100 : 0;

  let status: 'good' | 'warning' | 'critical';
  let interpretation: string;
  if (ratio <= 50) {
    status = 'good';
    interpretation = `Rasio pengeluaran wajib ${pct(ratio)}% — sehat. Pengeluaran kebutuhan pokok ≤ 50% dari pendapatan.`;
  } else if (ratio <= 60) {
    status = 'warning';
    interpretation = `Rasio pengeluaran wajib ${pct(ratio)}% — cukup. Mendekati batas, perlu diwaspadai.`;
  } else {
    status = 'critical';
    interpretation = `Rasio pengeluaran wajib ${pct(ratio)}% — tinggi. Kebutuhan pokok menyerap > 60% pendapatan, menyisakan sedikit ruang fleksibel.`;
  }

  return {
    value: pct(ratio),
    label: 'Rasio Pengeluaran Wajib',
    formula: 'Rasio Pengeluaran Wajib = (Pengeluaran Wajib / Pendapatan Bulanan) × 100%',
    interpretation,
    status,
  };
}

/**
 * Calculate non-essential expense ratio.
 * Formula: Non-Essential Ratio = (Non-Essential Expenses / Monthly Income) × 100
 * Measures discretionary spending as a share of income.
 * General benchmark: ≤ 20% is healthy, 20–30% is fair, > 30% is concerning.
 */
export function calculateNonEssentialExpenseRatio(input: AssessmentInput): RatioResult {
  const ratio =
    input.monthlyIncome > 0 ? (input.nonEssentialExpenses / input.monthlyIncome) * 100 : 0;

  let status: 'good' | 'warning' | 'critical';
  let interpretation: string;
  if (ratio <= 20) {
    status = 'good';
    interpretation = `Rasio pengeluaran non-wajib ${pct(ratio)}% — sehat. Pengeluaran diskresioner terkendali ≤ 20% dari pendapatan.`;
  } else if (ratio <= 30) {
    status = 'warning';
    interpretation = `Rasio pengeluaran non-wajib ${pct(ratio)}% — cukup. Pertimbangkan untuk mengurangi pengeluaran gaya hidup.`;
  } else {
    status = 'critical';
    interpretation = `Rasio pengeluaran non-wajib ${pct(ratio)}% — tinggi. Pengeluaran diskresioner > 30% dari pendapatan, perlu dikurangi.`;
  }

  return {
    value: pct(ratio),
    label: 'Rasio Pengeluaran Non-Wajib',
    formula: 'Rasio Pengeluaran Non-Wajib = (Pengeluaran Non-Wajib / Pendapatan Bulanan) × 100%',
    interpretation,
    status,
  };
}

/**
 * Calculate total expense ratio.
 * Formula: Total Expense Ratio = ((Essential + Non-Essential + Installments) / Income) × 100
 * Shows the overall portion of income consumed by all obligations.
 */
export function calculateTotalExpenseRatio(input: AssessmentInput): RatioResult {
  const totalExpenses =
    input.essentialExpenses + input.nonEssentialExpenses + input.monthlyInstallments;
  const ratio = input.monthlyIncome > 0 ? (totalExpenses / input.monthlyIncome) * 100 : 0;

  let status: 'good' | 'warning' | 'critical';
  let interpretation: string;
  if (ratio <= 80) {
    status = 'good';
    interpretation = `Total rasio pengeluaran ${pct(ratio)}% — sehat. ≤ 80% pendapatan terpakai, menyisakan ruang untuk tabungan.`;
  } else if (ratio <= 100) {
    status = 'warning';
    interpretation = `Total rasio pengeluaran ${pct(ratio)}% — perhatian. Hampir semua pendapatan terpakai.`;
  } else {
    status = 'critical';
    interpretation = `Total rasio pengeluaran ${pct(ratio)}% — defisit. Pengeluaran melebihi pendapatan.`;
  }

  return {
    value: pct(ratio),
    label: 'Total Rasio Pengeluaran',
    formula:
      'Total Rasio Pengeluaran = ((Wajib + Non-Wajib + Cicilan) / Pendapatan) × 100%',
    interpretation,
    status,
  };
}

/**
 * Calculate emergency fund coverage in months.
 * Formula: Coverage = Emergency Fund / Monthly Essential Expenses
 * Shows how many months the emergency fund can cover basic needs.
 * With dependents, the target increases: base 3 months + 1 month per dependent (max 6).
 * General benchmark: 3–6 months of essential expenses.
 */
export function calculateEmergencyFundCoverage(input: AssessmentInput): RatioResult {
  const targetMonths = Math.min(6, 3 + input.financialDependents);
  const coverageMonths =
    input.essentialExpenses > 0
      ? input.emergencyFund / input.essentialExpenses
      : 0;

  let status: 'good' | 'warning' | 'critical';
  let interpretation: string;

  if (input.essentialExpenses === 0) {
    status = 'warning';
    interpretation = 'Tidak dapat menghitung cakupan dana darurat karena pengeluaran wajib adalah 0.';
  } else if (coverageMonths >= targetMonths) {
    status = 'good';
    interpretation = `Dana darurat menutupi ${round1(coverageMonths)} bulan pengeluaran wajib — sehat. Target untuk Anda: ${targetMonths} bulan (3 bulan dasar + ${input.financialDependents} bulan untuk tanggungan).`;
  } else if (coverageMonths >= 1) {
    status = 'warning';
    interpretation = `Dana darurat menutupi ${round1(coverageMonths)} bulan — kurang dari target ${targetMonths} bulan. Tingkatkan hingga mencapai minimal ${targetMonths} bulan pengeluaran wajib.`;
  } else {
    status = 'critical';
    interpretation = `Dana darurat tidak cukup untuk menutupi 1 bulan pengeluaran wajib. Sangat berisiko jika terjadi keadaan darurat.`;
  }

  return {
    value: round1(coverageMonths),
    label: 'Cakupan Dana Darurat (bulan)',
    formula:
      'Cakupan Dana Darurat = Dana Darurat / Pengeluaran Wajib Bulanan. Target: 3 bulan + 1 bulan per tanggungan (maks 6 bulan).',
    interpretation,
    status,
  };
}

/**
 * Compute all metrics from the given input.
 */
export function calculateAllMetrics(input: AssessmentInput): AssessmentMetrics {
  const netCashFlow = calculateNetCashFlow(input);
  const totalExpenses =
    input.essentialExpenses + input.nonEssentialExpenses + input.monthlyInstallments;

  return {
    netCashFlow,
    savingsRatio: calculateSavingsRatio(input),
    debtToIncomeRatio: calculateDebtToIncomeRatio(input),
    essentialExpenseRatio: calculateEssentialExpenseRatio(input),
    nonEssentialExpenseRatio: calculateNonEssentialExpenseRatio(input),
    totalExpenseRatio: calculateTotalExpenseRatio(input),
    emergencyFundCoverage: calculateEmergencyFundCoverage(input),
    totalExpenses,
    totalDebtPayments: input.monthlyInstallments,
  };
}
