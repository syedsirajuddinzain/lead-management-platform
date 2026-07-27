import api from './axios';

export const submitPublicLead = (payload) => api.post('/public/leads', payload).then((r) => r.data);

export const listLeads = (params) => api.get('/leads', { params }).then((r) => r.data);
export const getLead = (id) => api.get(`/leads/${id}`).then((r) => r.data);
export const createLead = (payload) => api.post('/leads', payload).then((r) => r.data);
export const updateLead = (id, payload) => api.patch(`/leads/${id}`, payload).then((r) => r.data);
export const updateLeadStatus = (id, status) => api.patch(`/leads/${id}/status`, { status }).then((r) => r.data);
export const assignLead = (id, userId) => api.patch(`/leads/${id}/assign`, { userId }).then((r) => r.data);
export const addLeadNote = (id, text) => api.post(`/leads/${id}/notes`, { text }).then((r) => r.data);
export const deleteLead = (id) => api.delete(`/leads/${id}`).then((r) => r.data);
export const getDashboardStats = () => api.get('/leads/stats').then((r) => r.data);
