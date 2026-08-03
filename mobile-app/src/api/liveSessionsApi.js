import axiosClient from './axiosClient';

export async function getMyUpcomingSessions() {
  const response = await axiosClient.get('/live-sessions/my-upcoming');
  return response.data.data;
}
// import axiosClient from './axiosClient';

export async function getSessionsByWeek(weekId) {
  const response = await axiosClient.get(`/live-sessions/week/${weekId}`);
  return response.data.data;
}

export async function createLiveSession(data) {
  const response = await axiosClient.post('/live-sessions', data);
  return response.data.data;
}
export async function getMyUpcomingSessionsTeacher() {
  const response = await axiosClient.get('/live-sessions/my-upcoming/teacher');
  return response.data.data;
}

export async function updateSessionStatus(id, status) {
  const response = await axiosClient.put(`/live-sessions/${id}/status`, { status });
  return response.data.data;
}