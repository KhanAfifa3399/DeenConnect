import axiosClient from './axiosClient';

export async function getAllDailySurahs() {
  const response = await axiosClient.get('/daily-surahs');
  return response.data.data;
}