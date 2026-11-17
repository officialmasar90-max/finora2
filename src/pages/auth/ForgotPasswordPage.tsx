import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft } from 'lucide-react';
import AuthLayout from '@/layouts/AuthLayout';
import AuthForm from '@/components/auth/AuthForm';
import { useAuth } from '@/contexts/AuthContext';
import { getAuthErrorMessage } from '@/utils/authErrors';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    const { error: resetError } = await resetPassword(email.trim());
    setLoading(false);

    if (resetError) {
      setError(getAuthErrorMessage(resetError, { context: 'forgot' }));
      return;
    }

    setSuccess(
      'Email pemulihan kata sandi telah dikirim. Periksa kotak masuk Anda untuk mengatur ulang kata sandi.'
    );
  };

  return (
    <AuthLayout
      title="Lupa Kata Sandi"
      subtitle="Masukkan email Anda dan kami akan mengirim tautan pemulihan."
      footer={
        <Link
          to="/login"
          className="inline-flex items-center gap-1.5 font-semibold text-emerald-600 hover:text-emerald-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke halaman masuk
        </Link>
      }
    >
      <AuthForm
        onSubmit={handleSubmit}
        submitLabel="Kirim Email Pemulihan"
        loading={loading}
        error={error}
        success={success}
      >
        <div>
          <label className="block text-sm font-medium text-navy-900 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@email.com"
              required
              autoComplete="email"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-navy-900 placeholder:text-gray-400 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />
          </div>
        </div>
      </AuthForm>
    </AuthLayout>
  );
}
