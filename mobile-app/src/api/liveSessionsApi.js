import axiosClient from './axiosClient';

export async function getMyUpcomingSessions() {
  const response = await axiosClient.get('/live-sessions/my-upcoming');
  return response.data.data;
}