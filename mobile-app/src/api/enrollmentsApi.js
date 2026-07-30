import axiosClient from './axiosClient';

export async function getMyEnrollments() {
  const response = await axiosClient.get('/enrollments/my');
  return response.data.data;
}

export async function enrollInCourse(courseId, notes) {
  const response = await axiosClient.post('/enrollments', { course_id: courseId, notes });
  return response.data.data;
}