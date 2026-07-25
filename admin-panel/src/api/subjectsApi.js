import axiosClient from './axiosClient';

export async function getAllSubjects() {
  const response = await axiosClient.get('/subjects');
  return response.data.data;
}

export async function createSubject(subjectData) {
  const response = await axiosClient.post('/subjects', subjectData);
  return response.data.data;
}

export async function updateSubject(id, subjectData) {
  const response = await axiosClient.put(`/subjects/${id}`, subjectData);
  return response.data.data;
}

export async function deleteSubject(id) {
  const response = await axiosClient.delete(`/subjects/${id}`);
  return response.data;
}