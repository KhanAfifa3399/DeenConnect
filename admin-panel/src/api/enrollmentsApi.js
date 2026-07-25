import axiosClient from './axiosClient';

export async function getCourseEnrollments(courseId) {
  const response = await axiosClient.get(`/enrollments/course/${courseId}`);
  return response.data.data;
}