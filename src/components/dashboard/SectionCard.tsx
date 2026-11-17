interface SectionCardProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export default function SectionCard({
  title,
  subtitle,
  action,
  children,
  className = '',
}: SectionCardProps) {
  return (
    <div className={`card p-5 sm:p-6 ${className}`}>
      <div className="flex items-start justify-between mb-5 gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-navy-900 truncate">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  );
}
