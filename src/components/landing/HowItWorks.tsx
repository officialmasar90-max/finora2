import { UserPlus, LayoutGrid, Bot } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Step {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
}

const steps: Step[] = [
  {
    number: '01',
    icon: UserPlus,
    title: 'Buat Akun Anda',
    description: 'Daftar dalam hitungan menit tanpa biaya. Amankan akun Anda dengan enkripsi tingkat bank dan mulai perjalanan keuangan Anda.',
  },
  {
    number: '02',
    icon: LayoutGrid,
    title: 'Hubungkan & Kategorikan',
    description: 'Catat transaksi, atur anggaran, dan tetapkan tujuan keuangan. Finora mengorganisir semuanya secara otomatis dalam dashboard yang intuitif.',
  },
  {
    number: '03',
    icon: Bot,
    title: 'Dapatkan Insight AI',
    description: 'Konsultan AI menganalisis data Anda dan memberikan saran personal. Ambil keputusan finansial yang lebih cerdas setiap hari.',
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 lg:py-28 bg-navy-950 relative overflow-hidden">
      {/* Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-navy-700/30 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-semibold mb-4">
            Cara Kerja
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Mulai dalam 3 langkah sederhana
          </h2>
          <p className="mt-4 text-navy-300 leading-relaxed">
            Tidak perlu menjadi ahli keuangan. Finora memandu Anda dari nol
            hingga mencapai tujuan finansial Anda.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 relative">
          {/* Connecting line */}
          <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-gradient-to-r from-emerald-500/0 via-emerald-500/30 to-emerald-500/0" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="relative text-center">
                {/* Number badge */}
                <div className="relative inline-flex items-center justify-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                    <Icon className="w-7 h-7 text-white" strokeWidth={1.8} />
                  </div>
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-navy-800 border border-emerald-500/30 flex items-center justify-center text-[11px] font-bold text-emerald-400">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
                <p className="text-sm text-navy-300 leading-relaxed max-w-xs mx-auto">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
