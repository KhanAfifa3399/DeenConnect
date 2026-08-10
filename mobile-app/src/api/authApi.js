import axiosClient from './axiosClient';

export async function login(email, password) {
  const response = await axiosClient.post('/auth/login', { email, password });
  return response.data;
}
export async function registerStudent(full_name, email, password, phone) {
  const response = await axiosClient.post('/auth/register', { full_name, email, password, phone });
  return response.data;
}

export async function registerTeacher(full_name, email, password, phone) {
  const response = await axiosClient.post('/auth/register/teacher', { full_name, email, password, phone });
  return response.data;
}