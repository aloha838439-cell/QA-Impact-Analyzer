import { useLocation } from 'react-router-dom';
import { Bell, Search } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

const PAGE_TITLES: Record<string, { title: string; subtitle: string }> = {
  '/dashboard': {
    title: 'Dashboard',
    subtitle: 'Overview of your QA metrics and recent activity',
  },
  '/analysis': {
    title: 'Impact Analysis',
    subtitle: 'Analyze change impact and get test case recommendations',
  },
  '/defects': {
    title: 'Defect Management',
    subtitle: 'Browse, search, and manage defect records',
  },
};

export default function Header() {
  const location = useLocation();
  const { user } = useAuthStore();
  const pageInfo = PAGE_TITLES[location.pathname] || {
    title: 'QA Platform',
    subtitle: '',
  };

  return (
    <header className="flex-shrink-0 h-16 bg-slate-800/50 border-b border-slate-700 flex items-center px-6 gap-4">
      {/* Page title */}
      <div className="flex-1 min-w-0">
        <h2 className="text-base font-semibold text-slate-200 leading-tight">{pageInfo.title}</h2>
        {pageInfo.subtitle && (
          <p className="text-xs text-slate-500 truncate hidden sm:block">{pageInfo.subtitle}</p>
        )}
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell (decorative) */}
        <button className="relative p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 rounded-lg transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center">
            <span className="text-xs font-semibold text-indigo-200">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <span className="text-sm text-slate-400 hidden md:block">{user?.username}</span>
        </div>
      </div>
    </header>
  );
}
