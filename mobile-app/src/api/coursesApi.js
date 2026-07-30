import axiosClient from './axiosClient';

export async function getAllCourses() {
  const response = await axiosClient.get('/courses');
  return response.data.data;
}

export async function getCourseById(id) {
  const response = await axiosClient.get(`/courses/${id}`);
  return response.data.data;
}