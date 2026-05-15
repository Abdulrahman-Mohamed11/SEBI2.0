import client from './client';

export const createIssueApi = (formData) =>
  client.post('/issues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getMyIssuesApi = () => client.get('/issues/my');

export const getAllIssuesApi = () => client.get('/issues/all');

export const getAssignedIssuesApi = () => client.get('/issues/assigned');

export const updateIssueStatusApi = (id, status) =>
  client.patch(`/issues/${id}/status`, { status });

export const assignWorkerApi = (issueId, workerId) =>
  client.post(`/issues/${issueId}/assign`, { workerId });

export const markInProgressApi = (id) =>
  client.patch(`/issues/${id}/in-progress`);

export const getWorkersApi = () => client.get('/users/workers');

export const deleteIssueApi = (id) => client.delete(`/issues/${id}`);

export const deleteIssueManagerApi = (id) => client.delete(`/issues/${id}/manager`);
