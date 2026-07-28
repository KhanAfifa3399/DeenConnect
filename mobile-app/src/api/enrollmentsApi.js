import axiosClient from './axiosClient';

export async function getMyEnrollments() {
  const response = await axiosClient.get('/enrollments/my');
  return response.data.data;
}