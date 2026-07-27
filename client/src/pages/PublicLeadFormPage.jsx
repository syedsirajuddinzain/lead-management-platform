import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Zap, CheckCircle2 } from 'lucide-react';
import * as leadsApi from '../api/leads.api';
import Button from '../components/common/Button';
import { Input, Textarea } from '../components/common/FormControls';

const EMPTY_FORM = { name: '', email: '', phone: '', company: '', message: '' };

export default function PublicLeadFormPage() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your full name';
    if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(form.email)) next.email = 'Please enter a valid email';
    if (!/^[+]?[\d\s()-]{7,20}$/.test(form.phone)) next.phone = 'Please enter a valid phone number';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await leadsApi.submitPublicLead(form);
      setSubmitted(true);
      setForm(EMPTY_FORM);
    } catch (err) {
      const message = err.response?.data?.message || 'Something went wrong. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="rounded-xl bg-brand-600 p-3 shadow-lg shadow-brand-600/20">
            <Zap className="h-6 w-6 text-white" fill="currentColor" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">Get in touch</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Tell us a bit about yourself and we&apos;ll be in touch shortly.
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-card">
          {submitted ? (
            <div className="flex flex-col items-center py-6 text-center animate-fade-in">
              <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">Thank you!</h2>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your submission has been received. A member of our team will reach out soon.
              </p>
              <Button variant="secondary" className="mt-6" onClick={() => setSubmitted(false)}>
                Submit another response
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full name" id="name" name="name" placeholder="Jane Doe" value={form.name} onChange={handleChange} error={errors.name} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Email" id="email" name="email" type="email" placeholder="you@company.com" value={form.email} onChange={handleChange} error={errors.email} />
                <Input label="Phone" id="phone" name="phone" placeholder="+1 555 123 4567" value={form.phone} onChange={handleChange} error={errors.phone} />
              </div>
              <Input label="Company (optional)" id="company" name="company" placeholder="Acme Inc." value={form.company} onChange={handleChange} />
              <Textarea label="Message (optional)" id="message" name="message" placeholder="What are you interested in?" value={form.message} onChange={handleChange} />
              <Button type="submit" className="w-full" loading={loading}>
                Submit
              </Button>
            </form>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Team member?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
