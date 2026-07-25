import axiosClient from './axiosClient';

export async function getSessionsByWeek(weekId) {
  const response = await axiosClient.get(`/live-sessions/week/${weekId}`);
  return response.data.data;
}

export async function createLiveSession(sessionData) {
  const response = await axiosClient.post('/live-sessions', sessionData);
  return response.data.data;
}

export async function updateSessionStatus(id, status) {
  const response = await axiosClient.put(`/live-sessions/${id}/status`, { status });
  return response.data.data;
}

export async function deleteLiveSession(id) {
  const response = await axiosClient.delete(`/live-sessions/${id}`);
  return response.data;
}