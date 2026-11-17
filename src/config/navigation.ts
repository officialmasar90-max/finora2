import {
  LayoutDashboard,
  ArrowRightLeft,
  TrendingUp,
  Bot,
  Wallet,
  CreditCard,
  Target,
  FileBarChart,
  Settings,
  type LucideIcon,
} from 'lucide-react';

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  description: string;
}

export const navItems: NavItem[] = [
  {
    label: 'Dasbor',
    path: '/dashboard',
    icon: LayoutDashboard,
    description: 'Ringkasan keuangan Anda',
  },
  {
    label: 'Transaksi',
    path: '/transactions',
    icon: ArrowRightLeft,
    description: 'Riwayat pemasukan dan pengeluaran',
  },
  {
    label: 'Analisis Keuangan',
    path: '/analysis',
    icon: TrendingUp,
    description: 'Grafik dan tren keuangan',
  },
  {
    label: 'Konsultan AI',
    path: '/ai-consultant',
    icon: Bot,
    description: 'Saran keuangan cerdas dari AI',
  },
  {
    label: 'Perencana Anggaran',
    path: '/budget',
    icon: Wallet,
    description: 'Atur dan lacak anggaran Anda',
  },
  {
    label: 'Manajemen Utang',
    path: '/debt',
    icon: CreditCard,
    description: 'Kelola dan lunasi utang Anda',
  },
  {
    label: 'Tujuan Keuangan',
    path: '/goals',
    icon: Target,
    description: 'Target tabungan dan pencapaian',
  },
  {
    label: 'Laporan Keuangan',
    path: '/reports',
    icon: FileBarChart,
    description: 'Laporan keuangan periodik',
  },
  {
    label: 'Pengaturan',
    path: '/settings',
    icon: Settings,
    description: 'Konfigurasi akun dan aplikasi',
  },
];
