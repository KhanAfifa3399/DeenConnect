import axiosClient from './axiosClient';

export async function getRecentLogs() {
  const response = await axiosClient.get('/activity-logs');
  return response.data.data;
}
export async function getNotificationLogs() {
  const response = await axiosClient.get('/activity-logs/notifications');
  return response.data.data;
}