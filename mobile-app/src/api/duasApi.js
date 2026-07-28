import axiosClient from './axiosClient';

export async function getAllDuas() {
  const response = await axiosClient.get('/duas');
  return response.data.data;
}