import { Loader2 } from 'lucide-react';

export default function FullPageLoader({ message = 'Memuat...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
      <p className="text-sm text-gray-500 font-medium">{message}</p>
    </div>
  );
}
