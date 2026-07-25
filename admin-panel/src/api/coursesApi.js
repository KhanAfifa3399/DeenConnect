import axiosClient from './axiosClient';

export async function getAllCourses() {
  const response = await axiosClient.get('/courses');
  return response.data.data;
}

export async function createCourse(courseData) {
  const response = await axiosClient.post('/courses', courseData);
  return response.data.data;
}

export async function updateCourse(id, courseData) {
  const response = await axiosClient.put(`/courses/${id}`, courseData);
  return response.data.data;
}

export async function deleteCourse(id) {
  const response = await axiosClient.delete(`/courses/${id}`);
  return response.data;
}
export async function getCourseById(id) {
  const response = await axiosClient.get(`/courses/${id}`);
  return response.data.data;
}