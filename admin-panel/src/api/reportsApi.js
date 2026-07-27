import axiosClient from './axiosClient';

export async function getReportSummary() {
  const response = await axiosClient.get('/reports/summary');
  return response.data.data;
}