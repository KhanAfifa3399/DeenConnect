import axiosClient from './axiosClient';

export async function getStudentAnnouncements() {
  const response = await axiosClient.get('/announcements/student');
  return response.data.data;
}

export async function getTeacherAnnouncements() {
  const response = await axiosClient.get('/announcements/teacher');
  return response.data.data;
}

export async function createAnnouncement(data) {
  const response = await axiosClient.post('/announcements', data);
  return response.data.data;
}

export async function getMyAnnouncements() {
  const response = await axiosClient.get('/announcements/mine');
  return response.data.data;
}

export async function updateAnnouncement(id, data) {
  const response = await axiosClient.put(`/announcements/${id}`, data);
  return response.data.data;
}

export async function deleteAnnouncement(id) {
  const response = await axiosClient.delete(`/announcements/${id}`);
  return response.data;
}