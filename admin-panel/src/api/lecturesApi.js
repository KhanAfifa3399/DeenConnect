import axiosClient from './axiosClient';

export async function getLecturesByWeek(weekId) {
  const response = await axiosClient.get(`/lectures/week/${weekId}`);
  return response.data.data;
}
export async function uploadLectureVideo(weekId, formData) {
  const response = await axiosClient.post('/lectures', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}
export async function updateLecture(id, lectureData) {
  const response = await axiosClient.put(`/lectures/${id}`, lectureData);
  return response.data.data;
}

export async function deleteLecture(id) {
  const response = await axiosClient.delete(`/lectures/${id}`);
  return response.data;
}