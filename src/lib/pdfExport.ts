// ─── PDF Export for Financial Reports ─────────────────────────
//
// Generates a multi-page PDF report using jsPDF. Uses built-in Helvetica fonts
// with ASCII-safe text (Indonesian is fully ASCII-compatible for currency names).
// All monetary values are formatted as Indonesian Rupiah.

import { jsPDF } from 'jspdf';
import type { ReportData } from './reportAggregation';
import { formatReportSummaryText } from './reportAggregation';
import { formatIDR } from '@/utils/format';

const PAGE_WIDTH = 210; // A4 mm
const PAGE_HEIGHT = 297;
const MARGIN = 18;
const LINE_HEIGHT = 5.4;

function formatPeriodShort(period: ReportData['period']): string {
  return period.key.replace(/[^0-9-]/g, '');
}

export function exportReportToPdf(data: ReportData): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  let y = MARGIN;

  const ensureSpace = (needed: number) => {
    if (y + needed > PAGE_HEIGHT - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  const writeLine = (text: string, opts?: { bold?: boolean; size?: number; color?: [number, number, number]; indent?: number }) => {
    const size = opts?.size ?? 10;
    const bold = opts?.bold ?? false;
    const color = opts?.color ?? [30, 41, 59];
    const indent = opts?.indent ?? 0;
    doc.setFont('helvetica', bold ? 'bold' : 'normal');
    doc.setFontSize(size);
    doc.setTextColor(color[0], color[1], color[2]);
    // Simple wrapping
    const maxWidth = PAGE_WIDTH - MARGIN * 2 - indent;
    const lines = doc.splitTextToSize(text, maxWidth) as string[];
    for (const line of lines) {
      ensureSpace(LINE_HEIGHT);
      doc.text(line, MARGIN + indent, y);
      y += LINE_HEIGHT;
    }
  };

  const writeSpacer = (h = 3) => {
    y += h;
  };

  const writeDivider = () => {
    ensureSpace(6);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);
    y += 5;
  };

  // ─── Header ──────────────────────────────────────────────────
  doc.setFillColor(16, 42, 67); // navy
  doc.rect(0, 0, PAGE_WIDTH, 30, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('Laporan Keuangan Finora', MARGIN, 14);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.text(data.period.label, MARGIN, 22);
  y = 40;

  // Period info
  writeLine(`Periode Laporan: ${data.period.startDate} s/d ${data.period.endDate}`, { bold: true, size: 11 });
  writeLine(`Dihasilkan: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`, { size: 9, color: [100, 116, 139] });
  writeSpacer(4);
  writeDivider();

  // ─── Summary Section ─────────────────────────────────────────
  writeLine('Ringkasan Keuangan', { bold: true, size: 13 });
  writeSpacer(2);
  writeLine(`Pendapatan: ${formatIDR(data.income)}`, { indent: 3 });
  writeLine(`Pengeluaran: ${formatIDR(data.expenses)}`, { indent: 3 });
  writeLine(`Arus Kas Bersih: ${formatIDR(data.cashFlow)}`, { indent: 3 });
  writeLine(`Rasio Tabungan: ${data.savingsRate}%`, { indent: 3 });
  writeLine(`Jumlah Transaksi: ${data.transactionCount}`, { indent: 3 });
  writeSpacer(3);
  writeDivider();

  // ─── Expense Categories ──────────────────────────────────────
  writeLine('Pengeluaran per Kategori', { bold: true, size: 13 });
  writeSpacer(2);
  if (data.topExpenses.length === 0) {
    writeLine('Tidak ada data pengeluaran pada periode ini.', { size: 9, color: [100, 116, 139], indent: 3 });
  } else {
    for (const e of data.topExpenses) {
      writeLine(`${e.category}: ${formatIDR(e.amount)} (${e.percentage}%)`, { indent: 3 });
    }
  }
  writeSpacer(3);
  writeDivider();

  // ─── Budget Performance ──────────────────────────────────────
  if (data.budgetPerformance.length > 0) {
    writeLine('Kinerja Anggaran', { bold: true, size: 13 });
    writeSpacer(2);
    for (const b of data.budgetPerformance) {
      const statusText =
        b.status === 'no-spending' ? 'belum ada pengeluaran'
        : b.status === 'danger' ? 'MELEBIHI BATAS'
        : b.status === 'warning' ? 'mendekati batas'
        : 'aman';
      writeLine(`${b.category}: ${formatIDR(b.spent)} / ${formatIDR(b.limit)} (${b.percentage}% - ${statusText})`, { indent: 3 });
    }
    writeSpacer(3);
    writeDivider();
  }

  // ─── Debt Snapshot ───────────────────────────────────────────
  writeLine('Kondisi Utang (saat ini)', { bold: true, size: 13 });
  writeSpacer(2);
  writeLine(`Utang aktif: ${data.debtSnapshot.activeCount}`, { indent: 3 });
  writeLine(`Total pokok: ${formatIDR(data.debtSnapshot.totalPrincipal)}`, { indent: 3 });
  writeLine(`Cicilan bulanan: ${formatIDR(data.debtSnapshot.monthlyInstallments)}`, { indent: 3 });
  writeSpacer(3);
  writeDivider();

  // ─── Goals Snapshot ──────────────────────────────────────────
  writeLine('Kondisi Tujuan Keuangan (saat ini)', { bold: true, size: 13 });
  writeSpacer(2);
  writeLine(`Tujuan tercapai: ${data.goalsSnapshot.achievedCount} dari ${data.goalsSnapshot.totalCount}`, { indent: 3 });
  writeLine(`Total tersimpan: ${formatIDR(data.goalsSnapshot.totalSaved)} dari ${formatIDR(data.goalsSnapshot.totalTarget)} (${data.goalsSnapshot.overallProgress}%)`, { indent: 3 });
  writeSpacer(3);
  writeDivider();

  // ─── Disclaimer ──────────────────────────────────────────────
  writeLine('Catatan', { bold: true, size: 11 });
  writeLine(
    'Laporan ini dihasilkan otomatis dari data transaksi, anggaran, utang, dan tujuan keuangan pribadi Anda di Finora. Angka utang dan tujuan mencerminkan kondisi terkini, bukan snapshot historis periode laporan. Laporan ini bersifat edukasi dan bukan saran dari penasihat keuangan berizin.',
    { size: 9, color: [100, 116, 139] }
  );

  // Save
  const filename = `Laporan-Keuangan-Finora-${formatPeriodShort(data.period)}.pdf`;
  doc.save(filename);
}
