import { useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import DashboardPreview from './DashboardPreview';

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="relative pt-28 lg:pt-36 pb-16 lg:pb-24 overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-gradient-to-br from-emerald-100/60 via-transparent to-navy-100/40 rounded-full blur-3xl" />
        <div className="absolute top-40 right-0 w-72 h-72 bg-emerald-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-navy-100/50 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Badge */}
        <div className="flex justify-center mb-6 animate-slide-up">
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs sm:text-sm font-semibold">
            <Sparkles className="w-4 h-4" />
            Didukung Kecerdasan Buatan
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-center text-4xl sm:text-5xl lg:text-6xl font-extrabold text-navy-900 leading-[1.15] tracking-tight max-w-4xl mx-auto animate-slide-up">
          Pahami Keuanganmu.
          <br />
          <span className="bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent">
            Kendalikan Masa Depanmu.
          </span>
        </h1>

        {/* Supporting copy */}
        <p className="mt-6 text-center text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed animate-slide-up">
          Finora membantu Anda memahami kondisi keuangan, mengelola pengeluaran,
          dan merencanakan masa depan dengan cerdas. Semua dalam satu platform
          yang intuitif dan aman.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-slide-up">
          <button
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white text-base font-semibold shadow-card hover:bg-emerald-700 hover:shadow-card-lg transition-all duration-200 active:scale-[0.98]"
          >
            Mulai Gratis Sekarang
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => document.querySelector('#how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white text-navy-900 text-base font-semibold border border-gray-200 shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all duration-200"
          >
            Lihat Cara Kerja
          </button>
        </div>

        {/* Trust indicators */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-gray-500 animate-fade-in">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Enkripsi tingkat bank
          </span>
          <span className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-emerald-600" /> Tanpa biaya tersembunyi
          </span>
        </div>

        {/* Dashboard preview */}
        <div className="mt-14 lg:mt-20 animate-slide-up">
          <DashboardPreview />
        </div>
      </div>
    </section>
  );
}
