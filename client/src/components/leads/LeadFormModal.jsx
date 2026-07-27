import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Input, Textarea, Select } from '../common/FormControls';
import * as leadsApi from '../../api/leads.api';

const EMPTY_FORM = { name: '', email: '', phone: '', company: '', message: '', priority: 'Medium', source: 'Website' };

export default function LeadFormModal({ open, onClose, onSaved, lead }) {
  const isEdit = Boolean(lead);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(
        lead
          ? {
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              company: lead.company || '',
              message: lead.message || '',
              priority: lead.priority,
              source: lead.source,
            }
          : EMPTY_FORM
      );
      setErrors({});
    }
  }, [open, lead]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Name must be at least 2 characters';
    if (!/^[\w.-]+@[\w.-]+\.\w+$/.test(form.email)) next.email = 'Invalid email address';
    if (!/^[+]?[\d\s()-]{7,20}$/.test(form.phone)) next.phone = 'Invalid phone number';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      if (isEdit) {
        await leadsApi.updateLead(lead._id, form);
        toast.success('Lead updated');
      } else {
        await leadsApi.createLead(form);
        toast.success('Lead created');
      }
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Lead' : 'Add New Lead'} size="lg">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full name" id="name" name="name" value={form.name} onChange={handleChange} error={errors.name} />
          <Input label="Email" id="email" name="email" type="email" value={form.email} onChange={handleChange} error={errors.email} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Phone" id="phone" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} />
          <Input label="Company" id="company" name="company" value={form.company} onChange={handleChange} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select label="Priority" id="priority" name="priority" value={form.priority} onChange={handleChange}>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </Select>
          <Select label="Source" id="source" name="source" value={form.source} onChange={handleChange}>
            <option value="Website">Website</option>
            <option value="Referral">Referral</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Other">Other</option>
          </Select>
        </div>
        <Textarea label="Message" id="message" name="message" value={form.message} onChange={handleChange} />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {isEdit ? 'Save Changes' : 'Create Lead'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
