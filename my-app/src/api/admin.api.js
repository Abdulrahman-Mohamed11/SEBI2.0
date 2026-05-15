import client from './client';

export const getAllUsersApi = () => client.get('/admin/users');

export const toggleUserStatusApi = (id) =>
  client.patch(`/admin/users/${id}/toggle`);

export const deleteUserApi = (id) => client.delete(`/admin/users/${id}`);
