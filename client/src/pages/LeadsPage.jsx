import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, ChevronLeft, ChevronRight, ArrowUpDown, Inbox } from 'lucide-react';
import * as leadsApi from '../api/leads.api';
import { useAuth } from '../context/AuthContext';
import { useDebounce } from '../hooks/useDebounce';
import Button from '../components/common/Button';
import { Input, Select } from '../components/common/FormControls';
import { StatusBadge, PriorityBadge, Avatar, TableSkeleton, EmptyState } from '../components/common/Display';
import LeadFormModal from '../components/leads/LeadFormModal';

export default function LeadsPage() {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [leads, setLeads] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(search, 400);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, sortBy, sortOrder };
      if (debouncedSearch) params.search = debouncedSearch;
      if (status) params.status = status;
      if (priority) params.priority = priority;

      const res = await leadsApi.listLeads(params);
      setLeads(res.data);
      setMeta(res.meta);
    } catch (err) {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, sortOrder, debouncedSearch, status, priority]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, status, priority]);

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search by name, email, company..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Select value={status} onChange={(e) => setStatus(e.target.value)} className="w-36">
            <option value="">All statuses</option>
            {['New', 'Contacted', 'Qualified', 'Won', 'Lost'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </Select>
          <Select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-32">
            <option value="">All priority</option>
            {['Low', 'Medium', 'High'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </Select>
          {isAdmin && (
            <Button icon={Plus} onClick={() => setModalOpen(true)}>
              Add Lead
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={8} cols={6} />
        ) : leads.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No leads found"
            description="Try adjusting your filters, or add a new lead to get started."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                  <SortableHeader label="Lead" field="name" sortBy={sortBy} sortOrder={sortOrder} onClick={toggleSort} />
                  <th className="px-4 py-3 font-medium">Company</th>
                  <SortableHeader label="Status" field="status" sortBy={sortBy} sortOrder={sortOrder} onClick={toggleSort} />
                  <SortableHeader label="Priority" field="priority" sortBy={sortBy} sortOrder={sortOrder} onClick={toggleSort} />
                  <th className="px-4 py-3 font-medium">Assigned To</th>
                  <SortableHeader label="Created" field="createdAt" sortBy={sortBy} sortOrder={sortOrder} onClick={toggleSort} />
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead._id}
                    onClick={() => navigate(`/leads/${lead._id}`)}
                    className="cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-slate-100">{lead.name}</p>
                      <p className="text-xs text-slate-400">{lead.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{lead.company || '—'}</td>
                    <td className="px-4 py-3"><StatusBadge status={lead.status} /></td>
                    <td className="px-4 py-3"><PriorityBadge priority={lead.priority} /></td>
                    <td className="px-4 py-3">
                      {lead.assignedTo ? (
                        <div className="flex items-center gap-2">
                          <Avatar name={lead.assignedTo.name} initials={lead.assignedTo.initials} size="sm" />
                          <span className="text-slate-600 dark:text-slate-300 hidden lg:inline">{lead.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && leads.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-4 py-3">
            <p className="text-xs text-slate-500">
              Showing page {meta.page} of {meta.totalPages} · {meta.total} total leads
            </p>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" icon={ChevronLeft} disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Prev
              </Button>
              <Button variant="secondary" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage((p) => p + 1)}>
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <LeadFormModal open={modalOpen} onClose={() => setModalOpen(false)} onSaved={fetchLeads} />
    </div>
  );
}

function SortableHeader({ label, field, sortBy, sortOrder, onClick }) {
  const active = sortBy === field;
  return (
    <th className="px-4 py-3 font-medium">
      <button onClick={() => onClick(field)} className="flex items-center gap-1 hover:text-slate-700 dark:hover:text-slate-200">
        {label}
        <ArrowUpDown className={`h-3 w-3 ${active ? 'text-brand-600' : 'text-slate-300'}`} />
        {active && <span className="text-[10px]">{sortOrder === 'asc' ? '↑' : '↓'}</span>}
      </button>
    </th>
  );
}
