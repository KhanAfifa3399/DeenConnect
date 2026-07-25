import axiosClient from './axiosClient';

export async function getDashboardStats() {
  const [usersRes, coursesRes, subjectsRes] = await Promise.all([
    axiosClient.get('/users'),
    axiosClient.get('/courses'),
    axiosClient.get('/subjects'),
  ]);

  const users = usersRes.data.data;
  const courses = coursesRes.data.data;
  const subjects = subjectsRes.data.data;

  return {
    totalStudents: users.filter((u) => u.role === 'student').length,
    totalTeachers: users.filter((u) => u.role === 'teacher').length,
    totalCourses: courses.length,
    totalSubjects: subjects.length,
    recentUsers: users.slice(0, 5),
  };
}