import axiosClient from './axiosClient';

export async function getAllAnnouncements() {
  const response = await axiosClient.get('/announcements');
  return response.data.data;
}

export async function createAnnouncement(data) {
  const response = await axiosClient.post('/announcements', data);
  return response.data.data;
}

export async function deleteAnnouncement(id) {
  const response = await axiosClient.delete(`/announcements/${id}`);
  return response.data;
}