import { Inbox } from 'lucide-react';

const STATUS_STYLES = {
  New: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400',
  Contacted: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  Qualified: 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400',
  Won: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400',
  Lost: 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
};

const PRIORITY_STYLES = {
  Low: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  Medium: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
  High: 'bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400',
};

export function StatusBadge({ status }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[status] || STATUS_STYLES.New}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${PRIORITY_STYLES[priority] || PRIORITY_STYLES.Medium}`}>
      {priority}
    </span>
  );
}

const AVATAR_COLORS = [
  'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500',
  'bg-teal-500', 'bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-pink-500',
];

function colorFromString(str = '') {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function Avatar({ name, initials, size = 'md' }) {
  const sizes = { sm: 'h-6 w-6 text-[10px]', md: 'h-9 w-9 text-xs', lg: 'h-12 w-12 text-sm' };
  const label = initials || name?.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase() || '?';
  return (
    <div
      className={`flex ${sizes[size]} shrink-0 items-center justify-center rounded-full font-semibold text-white ${colorFromString(name)}`}
      title={name}
    >
      {label}
    </div>
  );
}

export function TableSkeleton({ rows = 6, cols = 6 }) {
  return (
    <div className="animate-pulse">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-slate-100 dark:border-slate-800 px-4 py-4">
          {Array.from({ length: cols }).map((_, c) => (
            <div key={c} className="h-3.5 flex-1 rounded bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5">
      <div className="h-3 w-24 rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-3 h-7 w-16 rounded bg-slate-200 dark:bg-slate-800" />
    </div>
  );
}

export function EmptyState({ title = 'Nothing here yet', description, icon: Icon = Inbox, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-slate-100 dark:bg-slate-800 p-4">
        <Icon className="h-6 w-6 text-slate-400" />
      </div>
      <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
