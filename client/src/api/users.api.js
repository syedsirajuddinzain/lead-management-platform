import api from './axios';

export const listUsers = (params) => api.get('/users', { params }).then((r) => r.data);
export const createUser = (payload) => api.post('/users', payload).then((r) => r.data);
export const updateUser = (id, payload) => api.patch(`/users/${id}`, payload).then((r) => r.data);
export const deleteUser = (id) => api.delete(`/users/${id}`).then((r) => r.data);
