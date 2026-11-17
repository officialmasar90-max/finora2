import { ArrowRightLeft, Bot, CreditCard, Wallet, Target, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
  accent: string;
}

const features: Feature[] = [
  {
    icon: ArrowRightLeft,
    title: 'Pelacakan Keuangan',
    description: 'Catat setiap pemasukan dan pengeluaran secara otomatis. Kategorikan transaksi dengan mudah dan pantau arus kas Anda secara real-time.',
    accent: 'from-emerald-500 to-emerald-700',
  },
  {
    icon: Bot,
    title: 'Analisis Keuangan AI',
    description: 'Konsultan AI menganalisis pola pengeluaran Anda dan memberikan rekomendasi personal untuk mengoptimalkan kesehatan keuangan.',
    accent: 'from-navy-700 to-navy-900',
  },
  {
    icon: CreditCard,
    title: 'Manajemen Utang',
    description: 'Kelola semua utang dalam satu tempat. Lacak jadwal pembayaran, bunga, dan dapatkan strategi pelunasan yang paling efisien.',
    accent: 'from-gray-600 to-gray-800',
  },
  {
    icon: Wallet,
    title: 'Manajemen Anggaran',
    description: 'Buat anggaran bulanan per kategori dan dapatkan peringatan ketika pengeluaran mendekati batas. Kendalikan uang Anda dengan percaya diri.',
    accent: 'from-emerald-600 to-navy-800',
  },
  {
    icon: Target,
    title: 'Tujuan Keuangan',
    description: 'Tetapkan target tabungan dan lacak progres pencapaian Anda. Dari dana darurat hingga liburan impian, wujudkan tujuan Anda selangkah demi selangkah.',
    accent: 'from-emerald-500 to-emerald-600',
  },
  {
    icon: TrendingUp,
    title: 'Laporan Mendalam',
    description: 'Hasilkan laporan keuangan periodik yang komprehensif. Pahami tren, identifikasi pola, dan ambil keputusan finansial yang lebih baik.',
    accent: 'from-navy-600 to-navy-800',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4">
            Fitur Unggulan
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            Semua yang Anda butuhkan untuk
            <br className="hidden sm:block" /> mengelola keuangan
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Fitur lengkap yang dirancang untuk membantu Anda memahami, mengelola,
            dan meningkatkan kondisi keuangan secara menyeluruh.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group card card-hover p-6 lg:p-7"
              >
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.accent} flex items-center justify-center shadow-sm mb-5 group-hover:scale-110 transition-transform duration-200`}>
                  <Icon className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <h3 className="text-lg font-bold text-navy-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
