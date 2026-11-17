import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Landmark, ShieldCheck, TrendingUp } from 'lucide-react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  footer?: React.ReactNode;
}

export default function AuthLayout({ children, title, subtitle, footer }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left panel — branding (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-navy-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-navy-700/30 rounded-full blur-3xl" />

        <div className="relative flex flex-col justify-between p-12 text-white">
          <Link to="/">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-sm">
                <Landmark className="w-5 h-5 text-white" strokeWidth={2.5} />
              </div>
              <span className="text-xl font-extrabold tracking-tight">Finora</span>
            </div>
          </Link>

          <div>
            <h2 className="text-3xl font-extrabold leading-tight max-w-sm">
              Pahami Keuanganmu.
              <br />
              Kendalikan Masa Depanmu.
            </h2>
            <p className="mt-4 text-navy-300 max-w-md leading-relaxed">
              Platform manajemen keuangan pribadi bertenaga AI. Kelola
              pemasukan, pengeluaran, dan tujuan finansial Anda dalam satu tempat.
            </p>

            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Enkripsi tingkat bank</p>
                  <p className="text-xs text-navy-400">Data Anda selalu aman</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Analisis cerdas</p>
                  <p className="text-xs text-navy-400">Wawasan keuangan otomatis</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs text-navy-500">© 2026 Finora. Hak cipta dilindungi.</p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {/* Mobile logo */}
        <div className="lg:hidden p-6">
          <Link to="/">
            <Logo />
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">
            <h1 className="text-2xl font-extrabold text-navy-900">{title}</h1>
            <p className="mt-2 text-sm text-gray-500">{subtitle}</p>

            <div className="mt-8">{children}</div>

            {footer && <div className="mt-6 text-center text-sm text-gray-500">{footer}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
