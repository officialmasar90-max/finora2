import { Link, useNavigate } from 'react-router-dom';
import { Landmark, Twitter, Instagram, Linkedin } from 'lucide-react';

const footerLinks = {
  Produk: [
    { label: 'Fitur', href: '#features' },
    { label: 'Cara Kerja', href: '#how-it-works' },
    { label: 'Harga', href: '#pricing' },
    { label: 'FAQ', href: '#faq' },
  ],
  Perusahaan: [
    { label: 'Tentang Kami', href: '#' },
    { label: 'Karir', href: '#' },
    { label: 'Blog', href: '#' },
    { label: 'Kontak', href: '#' },
  ],
  Legal: [
    { label: 'Kebijakan Privasi', href: '#' },
    { label: 'Syarat & Ketentuan', href: '#' },
    { label: 'Kebijakan Cookie', href: '#' },
  ],
};

export default function Footer() {
  const navigate = useNavigate();

  const handleNavClick = (href: string) => {
    if (href.startsWith('#') && href.length > 1) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-navy-950 text-navy-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* CTA band */}
        <div className="py-12 lg:py-16 border-b border-navy-800">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 text-center lg:text-left">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">
                Siap mengambil kendali keuangan Anda?
              </h3>
              <p className="mt-2 text-navy-400">
                Bergabung dengan ribuan pengguna yang sudah mengelola keuangan lebih cerdas bersama Finora.
              </p>
            </div>
            <button
              onClick={() => navigate('/dashboard')}
              className="shrink-0 px-6 py-3.5 rounded-xl bg-emerald-600 text-white text-base font-semibold shadow-md hover:bg-emerald-500 transition-all duration-200 active:scale-[0.98]"
            >
              Mulai Gratis Sekarang
            </button>
          </div>
        </div>

        {/* Footer content */}
        <div className="py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-sm">
                  <Landmark className="w-5 h-5 text-white" strokeWidth={2.5} />
                </div>
                <span className="text-xl font-extrabold tracking-tight text-white">Finora</span>
              </div>
            </Link>
            <p className="mt-4 text-sm leading-relaxed max-w-sm">
              Platform manajemen keuangan pribadi bertenaga AI. Pahami, kelola,
              dan tingkatkan kesehatan finansial Anda dalam satu tempat.
            </p>
            <div className="mt-5 flex items-center gap-3">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-navy-800 flex items-center justify-center text-navy-400 hover:bg-emerald-600 hover:text-white transition-all duration-200"
                  aria-label="Media sosial"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="text-sm font-semibold text-white mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <button
                      onClick={() => handleNavClick(link.href)}
                      className="text-sm text-navy-400 hover:text-emerald-400 transition-colors duration-200 text-left"
                    >
                      {link.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="py-6 border-t border-navy-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-navy-500">
            © 2026 Finora. Hak cipta dilindungi.
          </p>
          <p className="text-xs text-navy-500">
            Dibuat dengan hati di Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
