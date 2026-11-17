interface AuthErrorMessageOptions {
  context?: 'login' | 'register' | 'forgot' | 'reset' | 'update';
}

export function getAuthErrorMessage(error: unknown, options?: AuthErrorMessageOptions): string {
  const message = error instanceof Error ? error.message : String(error);
  const ctx = options?.context ?? 'login';

  // Supabase error messages mapped to Indonesian
  const map: Record<string, string> = {
    'Invalid login credentials': 'Email atau kata sandi salah. Silakan coba lagi.',
    'Invalid credentials': 'Email atau kata sandi salah. Silakan coba lagi.',
    'Email not confirmed': 'Email belum dikonfirmasi. Periksa kotak masuk Anda.',
    'User already registered': 'Email ini sudah terdaftar. Silakan masuk.',
    'Password should be at least 6 characters': 'Kata sandi harus minimal 6 karakter.',
    'Unable to send password reset': 'Gagal mengirim email pemulihan. Coba lagi nanti.',
    'New password should be different from the old password.':
      'Kata sandi baru harus berbeda dari kata sandi lama.',
  };

  for (const [eng, idn] of Object.entries(map)) {
    if (message.toLowerCase().includes(eng.toLowerCase())) return idn;
  }

  // Fallback by context
  if (message.includes('rate limit') || message.includes('too many')) {
    return 'Terlalu banyak percobaan. Tunggu sebentar lalu coba lagi.';
  }
  if (message.includes('network') || message.includes('fetch')) {
    return 'Koneksi jaringan bermasalah. Periksa internet Anda lalu coba lagi.';
  }

  if (ctx === 'register') return 'Pendaftaran gagal. Periksa data Anda dan coba lagi.';
  if (ctx === 'forgot') return 'Gagal mengirim email pemulihan. Coba lagi nanti.';
  if (ctx === 'reset') return 'Gagal mengatur ulang kata sandi. Coba lagi.';
  if (ctx === 'update') return 'Gagal memperbarui profil. Coba lagi.';

  return 'Terjadi kesalahan. Silakan coba lagi.';
}
