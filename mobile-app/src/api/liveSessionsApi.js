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