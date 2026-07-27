import axiosClient from './axiosClient';

export async function globalSearch(query) {
  const [coursesRes, subjectsRes] = await Promise.all([
    axiosClient.get('/courses'),
    axiosClient.get('/subjects'),
  ]);

  const term = query.toLowerCase();

  const courses = coursesRes.data.data
    .filter((c) => c.title.toLowerCase().includes(term))
    .slice(0, 4)
    .map((c) => ({ type: 'Course', label: c.title, path: `/courses/${c.id}` }));

  const subjects = subjectsRes.data.data
    .filter((s) => s.name.toLowerCase().includes(term))
    .slice(0, 4)
    .map((s) => ({ type: 'Subject', label: s.name, path: `/subjects` }));

  return [...courses, ...subjects];
}