import { useNavigate } from 'react-router-dom';
import { Check, Sparkles } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  highlighted: boolean;
}

const plans: PricingPlan[] = [
  {
    name: 'Gratis',
    price: 'Rp0',
    period: '/bulan',
    description: 'Sempurna untuk mulai memahami keuangan pribadi Anda.',
    features: [
      'Pelacakan transaksi hingga 50/bulan',
      'Dashboard ringkasan keuangan',
      '1 anggaran aktif',
      '1 tujuan keuangan',
      'Laporan bulanan dasar',
    ],
    cta: 'Mulai Gratis',
    highlighted: false,
  },
  {
    name: 'Premium',
    price: 'Rp49.000',
    period: '/bulan',
    description: 'Fitur lengkap dengan konsultan AI untuk hasil maksimal.',
    features: [
      'Transaksi tanpa batas',
      'Konsultan AI personal 24/7',
      'Anggaran & tujuan tanpa batas',
      'Analisis keuangan mendalam',
      'Manajemen utang lengkap',
      'Laporan mingguan, bulanan & tahunan',
      'Prioritas dukungan pelanggan',
    ],
    cta: 'Coba Premium',
    highlighted: true,
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <section id="pricing" className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-4">
            Harga
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-navy-900 tracking-tight">
            Pilih paket yang sesuai untuk Anda
          </h2>
          <p className="mt-4 text-gray-600 leading-relaxed">
            Mulai gratis, tingkatkan kapan saja. Tanpa biaya tersembunyi,
            tanpa kontrak jangka panjang.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-7 lg:p-8 transition-all duration-200 ${
                plan.highlighted
                  ? 'bg-navy-900 text-white shadow-card-lg scale-[1.02] border-2 border-emerald-500/30'
                  : 'bg-white text-navy-900 shadow-card border border-gray-100 hover:shadow-card-hover'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-semibold shadow-md">
                  <Sparkles className="w-3.5 h-3.5" /> Paling Populer
                </span>
              )}

              <h3 className={`text-lg font-bold ${plan.highlighted ? 'text-white' : 'text-navy-900'}`}>
                {plan.name}
              </h3>
              <p className={`mt-1.5 text-sm leading-relaxed ${plan.highlighted ? 'text-navy-300' : 'text-gray-500'}`}>
                {plan.description}
              </p>

              {/* Price */}
              <div className="mt-5 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tracking-tight">{plan.price}</span>
                <span className={`text-sm font-medium ${plan.highlighted ? 'text-navy-400' : 'text-gray-400'}`}>
                  {plan.period}
                </span>
              </div>

              {/* Features */}
              <ul className="mt-6 space-y-3">
                {plan.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        plan.highlighted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      <Check className="w-3 h-3" strokeWidth={3} />
                    </span>
                    <span className={`text-sm ${plan.highlighted ? 'text-navy-200' : 'text-gray-600'}`}>
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => navigate('/dashboard')}
                className={`mt-7 w-full px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 active:scale-[0.98] ${
                  plan.highlighted
                    ? 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-md'
                    : 'bg-navy-900 text-white hover:bg-navy-800'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          Harga ditampilkan dalam Rupiah (IDR). Informasional saja, belum tersedia pembayaran.
        </p>
      </div>
    </section>
  );
}
