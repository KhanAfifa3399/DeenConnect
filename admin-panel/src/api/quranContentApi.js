import axiosClient from './axiosClient';

export async function getContentByType(type) {
  const response = await axiosClient.get(`/quran-content/${type}`);
  return response.data.data;
}

export async function uploadQuranContent(formData) {
  const response = await axiosClient.post('/quran-content', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data.data;
}

export async function deleteQuranContent(id) {
  const response = await axiosClient.delete(`/quran-content/${id}`);
  return response.data;
}