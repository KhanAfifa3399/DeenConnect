import axiosClient from './axiosClient';

export async function getAllDailySurahs() {
  const response = await axiosClient.get('/daily-surahs');
  return response.data.data;
}

export async function createDailySurah(data) {
  const response = await axiosClient.post('/daily-surahs', data);
  return response.data.data;
}

export async function deleteDailySurah(id) {
  const response = await axiosClient.delete(`/daily-surahs/${id}`);
  return response.data;
}