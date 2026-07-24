import axiosClient from './axiosClient';

export async function login(email, password) {
  const response = await axiosClient.post('/auth/login', { email, password });
  return response.data;
}