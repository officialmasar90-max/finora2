import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export default function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-gray-300" strokeWidth={1.5} />
      </div>
      <p className="text-sm font-semibold text-navy-900">{title}</p>
      <p className="mt-1 text-sm text-gray-500 max-w-xs">{description}</p>
    </div>
  );
}
