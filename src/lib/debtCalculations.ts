// ─── Debt Repayment Calculation Engine ─────────────────────────
//
// All functions in this file are pure and deterministic. They take user-provided
// debt records and simulate month-by-month repayment under different strategies.
// No AI, no random values — every output is derived directly from inputs.
//
// ASSUMPTIONS (stated for transparency):
// 1. Interest is compounded monthly: monthly_rate = annual_rate / 12 / 100
// 2. Each month, interest accrues on the remaining balance before payment is applied.
// 3. Each debt requires at least its minimum_payment each month.
// 4. The user pays the monthly_installment on every active debt by default.
// 5. Any extra payment capacity (extraMonthlyPayment) is directed to a "target" debt:
//    - Snowball: the debt with the smallest current balance
//    - Avalanche: the debt with the highest interest rate
// 6. When a debt is paid off, its freed-up monthly_installment is reallocated
//    to the target debt (debt snowball/avalanche "cascade" effect).
// 7. The simulation caps at 600 months (50 years) to prevent infinite loops.
//
// IMPORTANT: These are simplified projections for educational purposes only.
// Actual loan terms, compounding rules, fees, and penalties vary by lender.
// This tool does NOT guarantee any specific outcome.

export interface DebtInput {
  id: string;
  name: string;
  principal: number;
  interest_rate: number; // annual percentage, e.g. 12.5
  monthly_installment: number;
  minimum_payment: number;
}

export interface DebtPayoffSchedule {
  debtId: string;
  debtName: string;
  monthsToPayoff: number;
  totalInterest: number;
  totalPaid: number;
}

export interface RepaymentResult {
  strategy: 'snowball' | 'avalanche';
  totalMonths: number;
  totalInterest: number;
  totalPaid: number;
  schedules: DebtPayoffSchedule[];
  assumptions: string[];
  explanation: string;
}

const MAX_MONTHS = 600;

function monthlyInterestRate(annualRate: number): number {
  return annualRate / 100 / 12;
}

interface SimDebt {
  id: string;
  name: string;
  balance: number;
  rate: number;
  monthlyRate: number;
  installment: number;
  minimumPayment: number;
  totalInterestPaid: number;
  totalPaid: number;
  monthsActive: number;
  payoffMonth: number | null;
}

function initSimDebts(debts: DebtInput[]): SimDebt[] {
  return debts.map((d) => ({
    id: d.id,
    name: d.name,
    balance: d.principal,
    rate: d.interest_rate,
    monthlyRate: monthlyInterestRate(d.interest_rate),
    installment: d.monthly_installment,
    minimumPayment: d.minimum_payment,
    totalInterestPaid: 0,
    totalPaid: 0,
    monthsActive: 0,
    payoffMonth: null,
  }));
}

function simulate(
  debts: DebtInput[],
  strategy: 'snowball' | 'avalanche',
  extraMonthlyPayment: number = 0
): RepaymentResult {
  const simDebts = initSimDebts(debts);
  const allPayoffs: { debtId: string; debtName: string; monthsToPayoff: number; totalInterest: number; totalPaid: number }[] = [];
  let month = 0;
  let totalExtraApplied = 0;

  while (month < MAX_MONTHS) {
    const active = simDebts.filter((d) => d.balance > 0.001);

    if (active.length === 0) break;

    month++;

    // Step 1: Accrue interest, apply minimum/installment payments
    for (const debt of simDebts) {
      if (debt.balance <= 0.001) continue;

      const interest = debt.balance * debt.monthlyRate;
      debt.balance += interest;
      debt.totalInterestPaid += interest;
      debt.monthsActive++;

      // Pay the installment (which should be >= minimum_payment for a valid plan)
      const payment = Math.min(debt.installment, debt.balance);
      debt.balance -= payment;
      debt.totalPaid += payment;
    }

    // Step 2: Calculate freed-up installment from debts paid off this month
    const freedUp = simDebts
      .filter((d) => d.balance <= 0.001 && d.payoffMonth === null)
      .reduce((sum, d) => sum + d.installment, 0);

    // Mark newly paid-off debts
    for (const debt of simDebts) {
      if (debt.balance <= 0.001 && debt.payoffMonth === null) {
        debt.payoffMonth = month;
        allPayoffs.push({
          debtId: debt.id,
          debtName: debt.name,
          monthsToPayoff: month,
          totalInterest: Math.round(debt.totalInterestPaid),
          totalPaid: Math.round(debt.totalPaid),
        });
      }
    }

    // Step 3: Direct extra + freed-up cash to target debt
    const stillActive = simDebts.filter((d) => d.balance > 0.001);
    if (stillActive.length === 0) break;

    let target: SimDebt;
    if (strategy === 'snowball') {
      target = stillActive.reduce((min, d) => (d.balance < min.balance ? d : min), stillActive[0]);
    } else {
      target = stillActive.reduce((max, d) => (d.rate > max.rate ? d : max), stillActive[0]);
    }

    const extraAvailable = extraMonthlyPayment + freedUp + totalExtraApplied;
    if (extraAvailable > 0 && target.balance > 0.001) {
      const extraPayment = Math.min(extraAvailable, target.balance);
      target.balance -= extraPayment;
      target.totalPaid += extraPayment;
      totalExtraApplied = 0; // extra is consumed each month (not cumulative for fixed extra)

      // If target paid off, mark it
      if (target.balance <= 0.001 && target.payoffMonth === null) {
        target.payoffMonth = month;
        allPayoffs.push({
          debtId: target.id,
          debtName: target.name,
          monthsToPayoff: month,
          totalInterest: Math.round(target.totalInterestPaid),
          totalPaid: Math.round(target.totalPaid),
        });
      }
    }
  }

  const totalInterest = simDebts.reduce((s, d) => s + d.totalInterestPaid, 0);
  const totalPaid = simDebts.reduce((s, d) => s + d.totalPaid, 0);

  const schedules = simDebts.map((d) => ({
    debtId: d.id,
    debtName: d.name,
    monthsToPayoff: d.payoffMonth ?? MAX_MONTHS,
    totalInterest: Math.round(d.totalInterestPaid),
    totalPaid: Math.round(d.totalPaid),
  }));

  const assumptions = [
    'Bunga dihitung secara bulanan (monthly compounding): tingkat tahunan / 12 / 100.',
    'Setiap bulan, bunga ditambahkan ke saldo sebelum pembayaran diterapkan.',
    'Pembayaran cicilan bulanan dibayarkan untuk setiap utang yang masih aktif.',
    'Saat utang ter Lunas, cicilan bulanannya dialokasikan ke utang target (efek cascade).',
    `Strategi ${strategy === 'snowball' ? 'Snowball' : 'Avalanche'}: pembayaran ekstra diarahkan ke utang ${strategy === 'snowball' ? 'dengan saldo terkecil' : 'dengan bunga tertinggi'}.`,
    'Simulasi dibatasi maksimal 600 bulan (50 tahun) untuk mencegah perhitungan tak terhingga.',
    'Estimasi ini adalah proyeksi sederhana untuk tujuan edukasi. Ketentuan pinjaman aktual (biaya, denda, aturan compounding) dapat berbeda per kreditur.',
  ];

  const explanation =
    strategy === 'snowball'
      ? 'Strategi Snowball melunasi utang dengan saldo terkecil lebih dulu untuk membangun momentum psikologis. Setiap utang yang lunas membebaskan cicilannya untuk dialokasikan ke utang berikutnya.'
      : 'Strategi Avalanche melunasi utang dengan bunga tertinggi lebih dulu untuk meminimalkan total bunga yang dibayarkan. Ini secara matematis menghasilkan total bunga terendah dalam simulasi ini.';

  return {
    strategy,
    totalMonths: month,
    totalInterest: Math.round(totalInterest),
    totalPaid: Math.round(totalPaid),
    schedules,
    assumptions,
    explanation,
  };
}

export function calculateSnowball(debts: DebtInput[], extraMonthlyPayment: number = 0): RepaymentResult {
  return simulate(debts, 'snowball', extraMonthlyPayment);
}

export function calculateAvalanche(debts: DebtInput[], extraMonthlyPayment: number = 0): RepaymentResult {
  return simulate(debts, 'avalanche', extraMonthlyPayment);
}

export interface StrategyComparison {
  snowball: RepaymentResult;
  avalanche: RepaymentResult;
  interestSavings: number; // avalanche saves this much vs snowball
  monthsSaved: number; // avalanche saves this many months vs snowball
  recommendedStrategy: 'snowball' | 'avalanche';
  recommendationReason: string;
}

export function compareStrategies(debts: DebtInput[], extraMonthlyPayment: number = 0): StrategyComparison {
  const snowball = calculateSnowball(debts, extraMonthlyPayment);
  const avalanche = calculateAvalanche(debts, extraMonthlyPayment);

  const interestSavings = snowball.totalInterest - avalanche.totalInterest;
  const monthsSaved = snowball.totalMonths - avalanche.totalMonths;

  const recommendedStrategy: 'snowball' | 'avalanche' = interestSavings > 0 ? 'avalanche' : 'snowball';
  const recommendationReason =
    recommendedStrategy === 'avalanche'
      ? `Avalanche menghemat Rp ${Math.round(interestSavings).toLocaleString('id-ID')} bunga${monthsSaved > 0 ? ` dan ${monthsSaved} bulan` : ''} dibanding Snowball.`
      : 'Snowball dan Avalanche menghasilkan total bunga yang sama untuk kasus ini. Pilih Snowball untuk kepuasan psikologis dari pelunasan lebih cepat.';

  return {
    snowball,
    avalanche,
    interestSavings: Math.round(interestSavings),
    monthsSaved,
    recommendedStrategy,
    recommendationReason,
  };
}

export function formatMonths(months: number): string {
  if (months <= 0) return '0 bulan';
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  if (years === 0) return `${remMonths} bulan`;
  if (remMonths === 0) return `${years} tahun`;
  return `${years} tahun ${remMonths} bulan`;
}
