// ─── Financial Health Report Generator ──────────────────────────
//
// This module generates a structured financial health report from the
// computed assessment metrics. Every statement is derived deterministically
// from the user's actual inputs and metric values — no invented data,
// no AI, no unsupported claims.
//
// The report contains five sections:
// 1. Financial strengths — metrics that are in good standing
// 2. Main financial problems — metrics in critical condition
// 3. Potential risks — forward-looking risks derived from current state
// 4. Areas for improvement — metrics in warning condition
// 5. Actionable recommendations — concrete steps tied to specific findings

import type { AssessmentInput, AssessmentMetrics, RatioResult } from './financialCalculations';
import { formatIDR } from '@/utils/format';

export interface ReportItem {
  title: string;
  description: string;
}

export interface FinancialReport {
  strengths: ReportItem[];
  problems: ReportItem[];
  risks: ReportItem[];
  improvements: ReportItem[];
  recommendations: ReportItem[];
  overallStatus: 'good' | 'warning' | 'critical';
  overallSummary: string;
}

/**
 * Generate the full financial health report.
 */
export function generateReport(
  input: AssessmentInput,
  metrics: AssessmentMetrics
): FinancialReport {
  const strengths: ReportItem[] = [];
  const problems: ReportItem[] = [];
  const risks: ReportItem[] = [];
  const improvements: ReportItem[] = [];
  const recommendations: ReportItem[] = [];

  // ─── Net cash flow ───────────────────────────────────────────
  if (metrics.netCashFlow.status === 'good') {
    strengths.push({
      title: 'Arus Kas Positif',
      description: `Pendapatan Anda melebihi semua kewajiban bulanan dengan surplus ${formatIDR(metrics.netCashFlow.value)} per bulan.`,
    });
  } else if (metrics.netCashFlow.status === 'critical') {
    problems.push({
      title: 'Arus Kas Negatif',
      description: `Pengeluaran bulanan melebihi pendapatan sebesar ${formatIDR(Math.abs(metrics.netCashFlow.value))} per bulan. Situasi ini tidak berkelanjutan tanpa perubahan.`,
    });
    recommendations.push({
      title: 'Tutup Defisit Arus Kas',
      description: `Anda perlu mengurangi pengeluaran atau menambah pendapatan minimal ${formatIDR(Math.abs(metrics.netCashFlow.value))} per bulan untuk mencapai titik impas. Prioritaskan pengurangan pengeluaran non-wajib terlebih dahulu.`,
    });
  } else {
    improvements.push({
      title: 'Arus Kas Nol',
      description: 'Pendapatan habis tepat untuk semua kewajiban. Tidak ada surplus untuk tabungan atau investasi.',
    });
  }

  // ─── Savings ratio ───────────────────────────────────────────
  if (metrics.savingsRatio.status === 'good') {
    strengths.push({
      title: 'Rasio Tabungan Sehat',
      description: metrics.savingsRatio.interpretation,
    });
  } else if (metrics.savingsRatio.status === 'critical') {
    if (metrics.savingsRatio.value < 0) {
      problems.push({
        title: 'Tidak Mampu Menabung',
        description: 'Pengeluaran melebihi pendapatan, sehingga tidak ada sisa untuk ditabung. Perlu penyesuaian segera.',
      });
    } else {
      problems.push({
        title: 'Rasio Tabungan Rendah',
        description: metrics.savingsRatio.interpretation,
      });
      recommendations.push({
        title: 'Tingkatkan Rasio Tabungan ke 20%',
        description: `Saat ini Anda menabung ${metrics.savingsRatio.value}% dari pendapatan. Target ideal adalah ≥ 20%. Naikkan secara bertahap 1–2% per bulan dengan mengurangi pengeluaran non-wajib.`,
      });
    }
  } else {
    improvements.push({
      title: 'Rasio Tabungan Perlu Ditingkatkan',
      description: metrics.savingsRatio.interpretation,
    });
    recommendations.push({
      title: 'Tingkatkan Tabungan ke 20%',
      description: 'Anda sudah menabung sebagian pendapatan. Tingkatkan bertahap hingga mencapai minimal 20% dari pendapatan bulanan.',
    });
  }

  // ─── Debt-to-income ratio ────────────────────────────────────
  if (metrics.debtToIncomeRatio.status === 'good') {
    if (input.monthlyInstallments === 0) {
      strengths.push({
        title: 'Bebas Cicilan Bulanan',
        description: 'Tidak ada kewajiban cicilan bulanan, sehingga seluruh pendapatan tersedia untuk kebutuhan dan tabungan.',
      });
    } else {
      strengths.push({
        title: 'Rasio Utang Sehat',
        description: metrics.debtToIncomeRatio.interpretation,
      });
    }
  } else if (metrics.debtToIncomeRatio.status === 'critical') {
    problems.push({
      title: 'Rasio Utang Tinggi',
      description: metrics.debtToIncomeRatio.interpretation,
    });
    recommendations.push({
      title: 'Turunkan Rasio DTI di Bawah 43%',
      description: `Cicilan Anda ${metrics.debtToIncomeRatio.value}% dari pendapatan. Pertimbangkan: (1) melunasi utang dengan bunga tertinggi lebih cepat, (2) negosiasi penurunan suku bunga, (3) hindari menambah utang baru. Target: turunkan di bawah 43%.`,
    });
  } else {
    improvements.push({
      title: 'Rasio Utang Perlu Diwaspadai',
      description: metrics.debtToIncomeRatio.interpretation,
    });
    recommendations.push({
      title: 'Jaga Rasio DTI Tetap di Bawah 30%',
      description: 'Cicilan Anda berada di zona 30–43%. Usahakan tidak menambah utang baru dan fokus melunasi yang ada untuk menurunkan rasio ke bawah 30%.',
    });
  }

  // ─── Essential expense ratio ─────────────────────────────────
  if (metrics.essentialExpenseRatio.status === 'good') {
    strengths.push({
      title: 'Pengeluaran Wajib Terkendali',
      description: metrics.essentialExpenseRatio.interpretation,
    });
  } else if (metrics.essentialExpenseRatio.status === 'critical') {
    problems.push({
      title: 'Pengeluaran Wajib Terlalu Tinggi',
      description: metrics.essentialExpenseRatio.interpretation,
    });
    risks.push({
      title: 'Risiko Tidak Fleksibel',
      description: 'Kebutuhan pokok menyerap porsi besar pendapatan, menyisakan sedikit ruang untuk menghadapi kejadian tak terduga atau peluang investasi.',
    });
    recommendations.push({
      title: 'Optimalkan Pengeluaran Wajib',
      description: 'Tinjau pos pengeluaran wajib (tempat tinggal, utilitas, transportasi). Pertimbangkan opsi seperti renegotiasi kontrak, efisiensi energi, atau transportasi alternatif untuk menurunkan di bawah 50% pendapatan.',
    });
  } else {
    improvements.push({
      title: 'Pengeluaran Wajib Mendekati Batas',
      description: metrics.essentialExpenseRatio.interpretation,
    });
  }

  // ─── Non-essential expense ratio ─────────────────────────────
  if (metrics.nonEssentialExpenseRatio.status === 'good') {
    strengths.push({
      title: 'Pengeluaran Non-Wajib Terkendali',
      description: metrics.nonEssentialExpenseRatio.interpretation,
    });
  } else if (metrics.nonEssentialExpenseRatio.status === 'critical') {
    problems.push({
      title: 'Pengeluaran Non-Wajib Berlebihan',
      description: metrics.nonEssentialExpenseRatio.interpretation,
    });
    recommendations.push({
      title: 'Kurangi Pengeluaran Gaya Hidup',
      description: `Pengeluaran non-wajib ${metrics.nonEssentialExpenseRatio.value}% dari pendapatan — idealnya ≤ 20%. Identifikasi 3 pos pengeluaran non-wajib terbesar dan kurangi masing-masing 20–30%. Alokasikan yang dihemat ke tabungan.`,
    });
  } else {
    improvements.push({
      title: 'Pengeluaran Non-Wajib Perlu Dikurangi',
      description: metrics.nonEssentialExpenseRatio.interpretation,
    });
    recommendations.push({
      title: 'Tinjau Pengeluaran Diskresioner',
      description: 'Pengeluaran non-wajib di zona 20–30%. Identifikasi pos yang bisa dikurangi (hiburan, makan di luar, belanja non-esensial) dan targetkan pengurangan 10–15%.',
    });
  }

  // ─── Emergency fund coverage ─────────────────────────────────
  const targetMonths = Math.min(6, 3 + input.financialDependents);

  if (metrics.emergencyFundCoverage.status === 'good') {
    strengths.push({
      title: 'Dana Darurat Mencukupi',
      description: metrics.emergencyFundCoverage.interpretation,
    });
  } else if (metrics.emergencyFundCoverage.status === 'critical') {
    problems.push({
      title: 'Dana Darurat Tidak Mencukupi',
      description: metrics.emergencyFundCoverage.interpretation,
    });
    risks.push({
      title: 'Risiko Keuangan Saat Darurat',
      description: `Dengan dana darurat saat ini, Anda tidak siap menghadapi kehilangan pendapatan atau pengeluaran tak terduga. ${input.financialDependents > 0 ? `Lebih berisiko karena Anda memiliki ${input.financialDependents} tanggungan.` : ''}`,
    });
    recommendations.push({
      title: `Bangun Dana Darurat ${targetMonths} Bulan`,
      description: `Target dana darurat Anda adalah ${targetMonths} × pengeluaran wajib bulanan = ${formatIDR(targetMonths * input.essentialExpenses)}. Mulai sisihkan sebagian surplus bulanan hingga target tercapai. Tempatkan di rekening terpisah yang mudah diakses.`,
    });
  } else {
    improvements.push({
      title: 'Dana Darurat Belum Mencapai Target',
      description: metrics.emergencyFundCoverage.interpretation,
    });
    recommendations.push({
      title: `Lengkapi Dana Darurat hingga ${targetMonths} Bulan`,
      description: `Anda memiliki ${metrics.emergencyFundCoverage.value} bulan cakupan, target ${targetMonths} bulan. Kekurangan: ${formatIDR((targetMonths - metrics.emergencyFundCoverage.value) * input.essentialExpenses)}. Sisihkan setiap bulan hingga tercapai.`,
    });
  }

  // ─── Risk: debt balance vs savings ───────────────────────────
  if (input.debtBalances > input.savings && input.debtBalances > 0) {
    risks.push({
      title: 'Utang Melebihi Tabungan',
      description: `Total utang ${formatIDR(input.debtBalances)} lebih besar dari total tabungan ${formatIDR(input.savings)}. Jika terjadi keadaan darurat, tabungan tidak cukup untuk menutupi utang.`,
    });
    recommendations.push({
      title: 'Prioritaskan Pelunasan Utang',
      description: 'Karena utang melebihi tabungan, fokuskan surplus bulanan untuk melunasi utang dengan bunga tertinggi terlebih dahulu (metode avalanche), sambil tetap mempertahankan dana darurat minimal.',
    });
  }

  // ─── Risk: high dependents with low emergency fund ───────────
  if (input.financialDependents > 0 && metrics.emergencyFundCoverage.status !== 'good') {
    risks.push({
      title: `Tanggungan ${input.financialDependents} Orang, Dana Darurat Kurang`,
      description: `Anda memiliki ${input.financialDependents} tanggungan finansial namun dana darurat belum mencukupi. Jika pendapatan terhenti, dampaknya lebih besar pada keluarga.`,
    });
  }

  // ─── Risk: no savings at all ─────────────────────────────────
  if (input.savings === 0 && input.emergencyFund === 0) {
    risks.push({
      title: 'Tidak Ada Tabungan atau Dana Darurat',
      description: 'Tidak memiliki cadangan keuangan apapun. Setiap pengeluaran tak terduga akan langsung menjadi utang atau mengganggu kebutuhan pokok.',
    });
    recommendations.push({
      title: 'Mulai Tabungan dari Nol',
      description: 'Buat rekening terpisah dan otomatisasi setoran bulanan, meskipun mulai dari jumlah kecil. Target pertama: setara 1 bulan pengeluaran wajib.',
    });
  }

  // ─── Overall status ──────────────────────────────────────────
  const allMetrics: RatioResult[] = [
    metrics.savingsRatio,
    metrics.debtToIncomeRatio,
    metrics.essentialExpenseRatio,
    metrics.nonEssentialExpenseRatio,
    metrics.totalExpenseRatio,
    metrics.emergencyFundCoverage,
  ];

  const criticalCount = allMetrics.filter((m) => m.status === 'critical').length
    + (metrics.netCashFlow.status === 'critical' ? 1 : 0);
  const warningCount = allMetrics.filter((m) => m.status === 'warning').length
    + (metrics.netCashFlow.status === 'warning' ? 1 : 0);

  let overallStatus: 'good' | 'warning' | 'critical';
  let overallSummary: string;

  if (criticalCount >= 3) {
    overallStatus = 'critical';
    overallSummary = `Kesehatan keuangan Anda memerlukan perhatian segera. ${criticalCount} metrik berada di tingkat kritis. Fokus pada perbaikan arus kas dan penanganan masalah paling mendesak terlebih dahulu.`;
  } else if (criticalCount > 0 || warningCount >= 3) {
    overallStatus = 'warning';
    overallSummary = `Kesehatan keuangan Anda cukup, namun ada ${criticalCount} masalah kritis dan ${warningCount} area yang perlu perhatian. Ikuti rekomendasi untuk memperbaiki posisi keuangan secara bertahap.`;
  } else {
    overallStatus = 'good';
    overallSummary = `Kesehatan keuangan Anda dalam kondisi baik. ${strengths.length} kekuatan teridentifikasi. Pertahankan kebiasaan positif dan terus tingkatkan cadangan keuangan.`;
  }

  return {
    strengths,
    problems,
    risks,
    improvements,
    recommendations,
    overallStatus,
    overallSummary,
  };
}
