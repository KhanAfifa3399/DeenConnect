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

// Uploads/replaces the course thumbnail image.
// Adjust the endpoint/field name below to match your backend route if it differs.
export async function uploadCourseThumbnail(id, file) {
  const formData = new FormData();
  formData.append('thumbnail', file);

  const response = await axiosClient.put(`/courses/${id}/thumbnail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}