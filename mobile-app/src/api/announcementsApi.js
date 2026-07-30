import axiosClient from './axiosClient';

export async function getStudentAnnouncements() {
  const response = await axiosClient.get('/announcements/student');
  return response.data.data;
}