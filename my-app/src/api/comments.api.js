import client from './client';

export const addCommentApi = (issueId, formData) =>
  client.post(`/issues/${issueId}/comments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const getCommentsApi = (issueId) =>
  client.get(`/issues/${issueId}/comments`);
