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

export async function uploadDuaAudio(id, file) {
  const formData = new FormData();
  formData.append('audio', file);

  // Don't set Content-Type manually — let axios/browser add the multipart
  // boundary automatically (see coursesApi.uploadCourseThumbnail for why).
  const response = await axiosClient.put(`/duas/${id}/audio`, formData, {
    headers: { 'Content-Type': undefined },
  });
  return response.data.data;
}