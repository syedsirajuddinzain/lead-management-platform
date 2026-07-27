import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import { Input } from '../components/common/FormControls';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (!form.email) return setErrors({ email: 'Email is required' });
    if (!form.password) return setErrors({ password: 'Password is required' });

    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center">
          <div className="rounded-xl bg-brand-600 p-3 shadow-lg shadow-brand-600/20">
            <Zap className="h-6 w-6 text-white" fill="currentColor" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Welcome to LeadFlow</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to manage your pipeline</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card">
          <Input
            label="Email address"
            id="email"
            name="email"
            type="email"
            placeholder="you@company.com"
            value={form.email}
            onChange={handleChange}
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            id="password"
            name="password"
            type="password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
          />
          <Button type="submit" className="w-full" loading={loading}>
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
            Create one
          </Link>
        </p>
        <p className="mt-2 text-center text-xs text-slate-400">
          Have a lead to submit?{' '}
          <Link to="/submit-lead" className="font-medium text-brand-600 hover:text-brand-700">
            Use the public form
          </Link>
        </p>
      </div>
    </div>
  );
}
