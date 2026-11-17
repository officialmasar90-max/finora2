import { NavLink } from 'react-router-dom';
import { navItems } from '@/config/navigation';

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileNav({ open, onClose }: MobileNavProps) {
  if (!open) return null;

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-card-lg animate-fade-in">
      <div className="grid grid-cols-5 gap-1 px-2 py-2 overflow-x-auto scrollbar-thin">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-1 py-1.5 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-emerald-600' : 'text-gray-500'
                }`
              }
            >
              <Icon className="w-5 h-5" strokeWidth={2} />
              <span className="truncate w-full text-center">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
