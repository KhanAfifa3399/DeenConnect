import axiosClient from './axiosClient';

export async function getContentByType(type) {
  const response = await axiosClient.get(`/quran-content/${type}`);
  return response.data.data;
}