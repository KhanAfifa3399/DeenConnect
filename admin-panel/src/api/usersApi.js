import axiosClient from './axiosClient';

export async function getAllUsers() {
  const response = await axiosClient.get('/users');
  return response.data.data;
}

export async function updateUser(id, userData) {
  const response = await axiosClient.put(`/users/${id}`, userData);
  return response.data.data;
}

export async function deleteUser(id) {
  const response = await axiosClient.delete(`/users/${id}`);
  return response.data;
}
export async function getTeachers() {
  const response = await axiosClient.get('/users');
  return response.data.data.filter((u) => u.role === 'teacher' && u.is_active);
}

export async function changePassword(currentPassword, newPassword) {
  const response = await axiosClient.put('/users/me/password', { currentPassword, newPassword });
  return response.data;
}

export async function uploadProfilePhoto(formData) {
  const response = await axiosClient.put('/users/me/photo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function getPendingTeachers() {
  const response = await axiosClient.get('/users/pending-teachers');
  return response.data.data;
}

export async function approveTeacher(id) {
  const response = await axiosClient.put(`/users/${id}/approve`);
  return response.data.data;
}

export async function rejectTeacher(id) {
  const response = await axiosClient.put(`/users/${id}/reject`);
  return response.data.data;
}

export async function getStudentDetail(id) {
  const response = await axiosClient.get(`/users/${id}/student-detail`);
  return response.data.data;
}