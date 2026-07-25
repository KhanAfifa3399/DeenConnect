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