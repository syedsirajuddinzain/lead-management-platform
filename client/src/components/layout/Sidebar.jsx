import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users2, UserCog, Settings, Zap } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, adminOnly: false },
  { to: '/leads', label: 'Leads', icon: Users2, adminOnly: false },
  { to: '/users', label: 'Manage Users', icon: UserCog, adminOnly: true },
  { to: '/settings', label: 'Settings', icon: Settings, adminOnly: false },
];

export default function Sidebar() {
  const { isAdmin } = useAuth();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="rounded-lg bg-brand-600 p-1.5">
          <Zap className="h-4 w-4 text-white" fill="currentColor" />
        </div>
        <span className="text-lg font-bold text-slate-900 dark:text-white">LeadFlow</span>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-2">
        {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 dark:bg-brand-500/10 text-brand-700 dark:text-brand-400'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`
            }
          >
            <item.icon className="h-4.5 w-4.5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-5 py-4 text-xs text-slate-400">v1.0.0 — LeadFlow CRM</div>
    </aside>
  );
}
