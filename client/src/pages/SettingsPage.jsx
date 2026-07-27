import { useState } from 'react';
import toast from 'react-hot-toast';
import { Moon, Sun } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as authApi from '../api/auth.api';
import Button from '../components/common/Button';
import { Input } from '../components/common/FormControls';
import { Avatar } from '../components/common/Display';

export default function SettingsPage() {
  const { user, refreshUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [name, setName] = useState(user.name);
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const next = {};
    if (name.trim().length < 2) next.name = 'Name must be at least 2 characters';
    if (password && (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password))) {
      next.password = 'Min 8 characters, with an uppercase letter and a number';
    }
    setErrors(next);
    if (Object.keys(next).length) return;

    setSaving(true);
    try {
      const payload = { name };
      if (password) payload.password = password;
      await authApi.updateMe(payload);
      await refreshUser();
      setPassword('');
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl space-y-6 animate-fade-in">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card">
        <div className="flex items-center gap-4">
          <Avatar name={user.name} initials={user.initials} size="lg" />
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
            <span className="mt-1 inline-block text-[10px] uppercase tracking-wide font-semibold text-brand-600">
              {user.role}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
          <Input
            label="New password (leave blank to keep current)"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            placeholder="••••••••"
          />
          <div className="flex justify-end">
            <Button type="submit" loading={saving}>Save Changes</Button>
          </div>
        </form>
      </div>

      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-3">Appearance</h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? <Moon className="h-5 w-5 text-slate-400" /> : <Sun className="h-5 w-5 text-slate-400" />}
            <span className="text-sm text-slate-600 dark:text-slate-300">Dark mode</span>
          </div>
          <button
            onClick={toggleTheme}
            className={`relative h-6 w-11 rounded-full transition-colors ${isDark ? 'bg-brand-600' : 'bg-slate-300'}`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${isDark ? 'translate-x-5' : 'translate-x-0.5'}`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
