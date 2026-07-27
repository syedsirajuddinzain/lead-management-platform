import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Plus, Trash2, Edit2, UserCog } from 'lucide-react';
import * as usersApi from '../api/users.api';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { Input, Select } from '../components/common/FormControls';
import { Avatar, TableSkeleton, EmptyState } from '../components/common/Display';

const EMPTY_FORM = { name: '', email: '', password: '', role: 'member' };

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await usersApi.listUsers({ limit: 100 });
      setUsers(res.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (u) => {
    setEditing(u);
    setForm({ name: u.name, email: u.email, password: '', role: u.role });
    setErrors({});
    setModalOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Name must be at least 2 characters';
    if (!editing) {
      if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(form.email)) next.email = 'Invalid email address';
      if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[0-9]/.test(form.password)) {
        next.password = 'Min 8 characters, with an uppercase letter and a number';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    try {
      if (editing) {
        await usersApi.updateUser(editing._id, { name: form.name, role: form.role });
        toast.success('User updated');
      } else {
        await usersApi.createUser(form);
        toast.success('User created');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (u) => {
    try {
      await usersApi.updateUser(u._id, { isActive: !u.isActive });
      toast.success(u.isActive ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await usersApi.deleteUser(deleteTarget._id);
      toast.success('User deleted');
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-end">
        <Button icon={Plus} onClick={openCreate}>Add User</Button>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-card overflow-hidden">
        {loading ? (
          <TableSkeleton rows={5} cols={4} />
        ) : users.length === 0 ? (
          <EmptyState icon={UserCog} title="No users yet" />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3 font-medium">User</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b border-slate-100 dark:border-slate-800 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} initials={u.initials} size="sm" />
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">{u.name}</p>
                        <p className="text-xs text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-400 capitalize">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(u)}
                      disabled={u._id === currentUser._id}
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed
                        ${u.isActive ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}
                    >
                      {u.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" icon={Edit2} onClick={() => openEdit(u)} />
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={Trash2}
                        disabled={u._id === currentUser._id}
                        onClick={() => setDeleteTarget(u)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Add User'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Full name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
          {!editing && (
            <>
              <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
              <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} error={errors.password} />
            </>
          )}
          <Select label="Role" name="role" value={form.role} onChange={handleChange}>
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </Select>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>{editing ? 'Save Changes' : 'Create User'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete this user?"
        description={`This will permanently remove ${deleteTarget?.name}'s account. Users with assigned leads must be reassigned first.`}
        confirmLabel="Delete User"
      />
    </div>
  );
}
