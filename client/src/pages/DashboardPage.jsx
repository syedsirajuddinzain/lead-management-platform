import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { Users2, TrendingUp, Trophy, Activity as ActivityIcon } from 'lucide-react';
import * as leadsApi from '../api/leads.api';
import { CardSkeleton, EmptyState, Avatar } from '../components/common/Display';

const STATUS_COLORS = {
  New: 'bg-blue-500',
  Contacted: 'bg-amber-500',
  Qualified: 'bg-purple-500',
  Won: 'bg-emerald-500',
  Lost: 'bg-slate-400',
};

function StatCard({ label, value, icon: Icon, accent }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
        <div className={`rounded-lg p-1.5 ${accent}`}>
          <Icon className="h-4 w-4 text-white" />
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    leadsApi
      .getDashboardStats()
      .then((res) => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!stats) return <EmptyState title="Unable to load dashboard" />;

  const totalForBar = Math.max(stats.total, 1);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Leads" value={stats.total} icon={Users2} accent="bg-brand-600" />
        <StatCard label="Qualified" value={stats.statusCounts.Qualified} icon={TrendingUp} accent="bg-purple-500" />
        <StatCard label="Won" value={stats.statusCounts.Won} icon={Trophy} accent="bg-emerald-500" />
        <StatCard label="Conversion Rate" value={`${stats.conversionRate}%`} icon={ActivityIcon} accent="bg-amber-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Pipeline Overview</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-600 dark:text-slate-300">{status}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-2 rounded-full ${STATUS_COLORS[status]}`}
                    style={{ width: `${(count / totalForBar) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <Link to="/leads" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              View all leads →
            </Link>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Recent Activity</h3>
          <div className="mt-4 space-y-4 max-h-96 overflow-y-auto scrollbar-thin">
            {stats.recentActivity.length === 0 && (
              <p className="text-sm text-slate-400">No activity yet.</p>
            )}
            {stats.recentActivity.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                <Avatar name={item.actor?.name || 'System'} initials={item.actor?.initials} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-700 dark:text-slate-200 truncate">
                    <span className="font-medium">{item.actor?.name || 'A visitor'}</span> — {item.message}
                  </p>
                  <p className="text-xs text-slate-400">
                    {item.leadName} · {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
