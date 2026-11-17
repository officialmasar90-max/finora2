import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User as UserIcon, Mail, Save, LogOut, ArrowLeft, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/utils/authErrors';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { profile, updateProfile, signOut, profileLoading } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const initials = (profile?.full_name || profile?.email || 'U')
    .split(' ')
    .map((s) => s[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSaving(true);

    const { error: updateError } = await updateProfile(fullName.trim());
    setSaving(false);

    if (updateError) {
      setError(getAuthErrorMessage(updateError, { context: 'update' }));
      return;
    }

    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => navigate('/settings')}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-navy-900 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Pengaturan
      </button>

      <div>
        <h2 className="text-2xl font-bold text-navy-900">Profil Saya</h2>
        <p className="text-sm text-gray-500 mt-1">Kelola informasi profil dan akun Anda</p>
      </div>

      {/* Profile card */}
      <div className="card p-6">
        <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-navy-700 to-navy-900 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold text-navy-900 truncate">
              {profile?.full_name || 'Pengguna Finora'}
            </p>
            <p className="text-sm text-gray-500 truncate">{profile?.email}</p>
          </div>
        </div>

        {/* Edit form */}
        <form onSubmit={handleSave} className="mt-6 space-y-5">
          {/* Full name */}
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">Nama Lengkap</label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nama Anda"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-navy-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="block text-sm font-medium text-navy-900 mb-1.5">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <input
                type="email"
                value={profile?.email ?? ''}
                disabled
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
              />
            </div>
            <p className="mt-1.5 text-xs text-gray-400">Email tidak dapat diubah</p>
          </div>

          {/* Error / success */}
          {error && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <p className="text-sm text-emerald-700">Profil berhasil diperbarui.</p>
            </div>
          )}

          {/* Save button */}
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 text-white text-sm font-semibold shadow-sm transition-all duration-200 hover:bg-emerald-700 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </button>
        </form>
      </div>

      {/* Danger zone */}
      <div className="card p-6">
        <h3 className="text-base font-bold text-navy-900 mb-1">Keluar dari Akun</h3>
        <p className="text-sm text-gray-500 mb-4">
          Anda akan keluar dari sesi saat ini dan perlu masuk kembali untuk mengakses dasbor.
        </p>
        <button
          onClick={handleSignOut}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-red-600 text-sm font-semibold border border-red-200 transition-all duration-200 hover:bg-red-50 active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          Keluar
        </button>
      </div>
    </div>
  );
}
