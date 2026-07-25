import axiosClient from './axiosClient';

export async function getWeeksByCourse(courseId) {
  const response = await axiosClient.get(`/weeks/course/${courseId}`);
  return response.data.data;
}