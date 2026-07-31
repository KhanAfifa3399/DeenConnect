import axiosClient from './axiosClient';

export async function getSessionAttendance(sessionId) {
  const response = await axiosClient.get(`/attendance/session/${sessionId}`);
  return response.data.data;
}

export async function markAttendance(liveSessionId, studentId, status) {
  const response = await axiosClient.post('/attendance', {
    live_session_id: liveSessionId,
    student_id: studentId,
    status,
    notes: null,
  });
  return response.data.data;
}