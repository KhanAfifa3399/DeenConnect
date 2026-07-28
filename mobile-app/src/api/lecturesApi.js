import axiosClient from './axiosClient';

export async function getLecturesByWeek(weekId) {
  const response = await axiosClient.get(`/lectures/week/${weekId}`);
  return response.data.data;
}