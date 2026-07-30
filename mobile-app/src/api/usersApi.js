import axiosClient from './axiosClient';

export async function updateProfile(id, data) {
  const response = await axiosClient.put(`/users/${id}`, data);
  return response.data.data;
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