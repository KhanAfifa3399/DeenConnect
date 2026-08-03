import axiosClient from './axiosClient';

export async function getLecturesByWeek(weekId) {
  const response = await axiosClient.get(`/lectures/week/${weekId}`);
  return response.data.data;
}
export async function uploadLecture(formData) {
  const response = await axiosClient.post('/lectures', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}
export async function getMyMissingVideoLectures() {
  const response = await axiosClient.get('/lectures/missing-videos/teacher');
  return response.data.data;
}