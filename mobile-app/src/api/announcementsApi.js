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