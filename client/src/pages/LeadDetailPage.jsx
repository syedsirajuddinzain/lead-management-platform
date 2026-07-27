import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ArrowLeft, Mail, Phone, Building2, Edit2, Trash2, UserPlus,
  MessageSquare, Clock, UserCheck, RefreshCw, PlusCircle, FileEdit,
} from 'lucide-react';
import * as leadsApi from '../api/leads.api';
import * as usersApi from '../api/users.api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Textarea, Select } from '../components/common/FormControls';
import { StatusBadge, PriorityBadge, Avatar, EmptyState } from '../components/common/Display';
import LeadFormModal from '../components/leads/LeadFormModal';

const STATUSES = ['New', 'Contacted', 'Qualified', 'Won', 'Lost'];

const ACTIVITY_ICONS = {
  LEAD_CREATED: PlusCircle,
  ASSIGNED: UserCheck,
  STATUS_CHANGED: RefreshCw,
  NOTE_ADDED: MessageSquare,
  LEAD_UPDATED: FileEdit,
};

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [noteText, setNoteText] = useState('');
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [assignTarget, setAssignTarget] = useState('');
  const [assigning, setAssigning] = useState(false);

  const fetchLead = useCallback(async () => {
    try {
      const res = await leadsApi.getLead(id);
      setLead(res.data.lead);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load lead');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchLead();
  }, [fetchLead]);

  useEffect(() => {
    if (isAdmin) {
      usersApi.listUsers({ role: 'member', limit: 100 }).then((res) => setMembers(res.data));
    }
  }, [isAdmin]);

  const handleStatusChange = async (status) => {
    try {
      const res = await leadsApi.updateLeadStatus(id, status);
      setLead(res.data.lead);
      toast.success(`Status updated to ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    setNoteSubmitting(true);
    try {
      const res = await leadsApi.addLeadNote(id, noteText.trim());
      setLead(res.data.lead);
      setNoteText('');
      toast.success('Note added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add note');
    } finally {
      setNoteSubmitting(false);
    }
  };

  const handleAssign = async () => {
    if (!assignTarget) return;
    setAssigning(true);
    try {
      const res = await leadsApi.assignLead(id, assignTarget);
      setLead(res.data.lead);
      toast.success('Lead assigned');
      setAssignOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to assign lead');
    } finally {
      setAssigning(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await leadsApi.deleteLead(id);
      toast.success('Lead deleted');
      navigate('/leads');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete lead');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!lead) return <EmptyState title="Lead not found" />;

  const timeline = [...lead.activity].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl">
      <button
        onClick={() => navigate('/leads')}
        className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
      >
        <ArrowLeft className="h-4 w-4" /> Back to leads
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{lead.name}</h2>
                <div className="mt-2 flex flex-wrap gap-2">
                  <StatusBadge status={lead.status} />
                  <PriorityBadge priority={lead.priority} />
                  <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {lead.source}
                  </span>
                </div>
              </div>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" icon={Edit2} onClick={() => setEditOpen(true)}>
                    Edit
                  </Button>
                  <Button variant="danger" size="sm" icon={Trash2} onClick={() => setDeleteOpen(true)}>
                    Delete
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Mail className="h-4 w-4 text-slate-400" /> {lead.email}
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Phone className="h-4 w-4 text-slate-400" /> {lead.phone}
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <Building2 className="h-4 w-4 text-slate-400" /> {lead.company || '—'}
              </div>
            </div>

            {lead.message && (
              <p className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 text-sm text-slate-600 dark:text-slate-300">
                {lead.message}
              </p>
            )}

            <div className="mt-5 pt-5 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={lead.status === s}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-colors
                      ${lead.status === s
                        ? 'bg-brand-600 text-white border-brand-600 cursor-default'
                        : 'border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4">Notes</h3>
            <form onSubmit={handleAddNote} className="mb-5 space-y-2">
              <Textarea
                placeholder="Add a note about this lead..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                rows={3}
              />
              <div className="flex justify-end">
                <Button type="submit" size="sm" loading={noteSubmitting} disabled={!noteText.trim()}>
                  Add Note
                </Button>
              </div>
            </form>

            <div className="space-y-4">
              {lead.notes.length === 0 && <p className="text-sm text-slate-400">No notes yet.</p>}
              {[...lead.notes].reverse().map((note) => (
                <div key={note._id} className="flex gap-3">
                  <Avatar name={note.author?.name} initials={note.author?.initials} size="sm" />
                  <div className="flex-1 rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">{note.author?.name}</span>
                      <span className="text-xs text-slate-400">
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{note.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Assignment</h3>
              {isAdmin && (
                <Button variant="ghost" size="sm" icon={UserPlus} onClick={() => { setAssignTarget(lead.assignedTo?._id || ''); setAssignOpen(true); }}>
                  {lead.assignedTo ? 'Reassign' : 'Assign'}
                </Button>
              )}
            </div>
            {lead.assignedTo ? (
              <div className="flex items-center gap-3">
                <Avatar name={lead.assignedTo.name} initials={lead.assignedTo.initials} />
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{lead.assignedTo.name}</p>
                  <p className="text-xs text-slate-400">{lead.assignedTo.email}</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Not yet assigned</p>
            )}
          </div>

          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-card">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
              <Clock className="h-4 w-4" /> Activity Timeline
            </h3>
            <div className="space-y-4 max-h-[28rem] overflow-y-auto scrollbar-thin">
              {timeline.map((item) => {
                const Icon = ACTIVITY_ICONS[item.type] || Clock;
                return (
                  <div key={item._id} className="flex gap-3">
                    <div className="mt-0.5 rounded-full bg-brand-50 dark:bg-brand-500/10 p-1.5 h-fit">
                      <Icon className="h-3.5 w-3.5 text-brand-600" />
                    </div>
                    <div>
                      <p className="text-sm text-slate-700 dark:text-slate-200">{item.message}</p>
                      <p className="text-xs text-slate-400">
                        {item.actor?.name || 'System'} · {format(new Date(item.createdAt), 'MMM d, h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <LeadFormModal open={editOpen} onClose={() => setEditOpen(false)} onSaved={fetchLead} lead={lead} />

      <Modal open={assignOpen} onClose={() => setAssignOpen(false)} title="Assign Lead" size="sm">
        <Select value={assignTarget} onChange={(e) => setAssignTarget(e.target.value)} label="Select team member">
          <option value="">Choose a member...</option>
          {members.map((m) => (
            <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
          ))}
        </Select>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="secondary" onClick={() => setAssignOpen(false)}>Cancel</Button>
          <Button onClick={handleAssign} loading={assigning} disabled={!assignTarget}>Assign</Button>
        </div>
      </Modal>

      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this lead?"
        description="This will remove the lead from all views. This action cannot be undone."
        confirmLabel="Delete Lead"
      />
    </div>
  );
}
