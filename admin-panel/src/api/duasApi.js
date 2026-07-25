import axiosClient from './axiosClient';

export async function getAllDuas() {
  const response = await axiosClient.get('/duas');
  return response.data.data;
}

export async function createDua(data) {
  const response = await axiosClient.post('/duas', data);
  return response.data.data;
}

export async function updateDua(id, data) {
  const response = await axiosClient.put(`/duas/${id}`, data);
  return response.data.data;
}

export async function deleteDua(id) {
  const response = await axiosClient.delete(`/duas/${id}`);
  return response.data;
}