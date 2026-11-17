import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mb-6">
        <Compass className="w-9 h-9 text-gray-400" strokeWidth={1.8} />
      </div>
      <p className="text-5xl font-extrabold text-navy-900">404</p>
      <p className="mt-2 text-lg font-semibold text-gray-700">Halaman Tidak Ditemukan</p>
      <p className="mt-1 text-sm text-gray-500 max-w-sm">
        Maaf, halaman yang Anda cari tidak tersedia atau telah dipindahkan.
      </p>
      <Link to="/dashboard" className="mt-6 btn-primary">
        Kembali ke Dasbor
      </Link>
    </div>
  );
}
