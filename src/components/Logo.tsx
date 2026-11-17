import { Landmark } from 'lucide-react';

interface LogoProps {
  variant?: 'full' | 'icon';
  className?: string;
}

export default function Logo({ variant = 'full', className = '' }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-sm">
        <Landmark className="w-5 h-5 text-white" strokeWidth={2.5} />
      </div>
      {variant === 'full' && (
        <span className="text-xl font-extrabold tracking-tight text-navy-900">
          Finora
        </span>
      )}
    </div>
  );
}
