import { useNavigate } from 'react-router-dom';
import { Settings, User as UserIcon, ArrowRight } from 'lucide-react';

export default function SettingsPage() {
  const navigate = useNavigate();

  const sections = [
    {
      icon: UserIcon,
      title: 'Profil Saya',
      description: 'Kelola nama tampilan dan informasi akun Anda',
      action: () => navigate('/profile'),
    },
    {
      icon: Settings,
      title: 'Preferensi Aplikasi',
      description: 'Kategori transaksi, mata uang, dan notifikasi',
      badge: 'Segera Hadir',
    },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-navy-900">Pengaturan</h2>
        <p className="text-sm text-gray-500 mt-1">Kelola akun dan preferensi aplikasi Anda</p>
      </div>

      <div className="space-y-3">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <button
              key={section.title}
              onClick={section.action}
              disabled={!section.action}
              className="w-full card card-hover p-5 flex items-center gap-4 text-left disabled:cursor-default"
            >
              <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-white" strokeWidth={2} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-navy-900">{section.title}</h3>
                  {section.badge && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">
                      {section.badge}
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 mt-0.5">{section.description}</p>
              </div>
              {section.action && (
                <ArrowRight className="w-5 h-5 text-gray-300 shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
