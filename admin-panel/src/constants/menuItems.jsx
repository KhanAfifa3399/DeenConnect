import {
  FiHome, FiUsers, FiUser, FiBook, FiVideo, FiRadio, FiGrid,
  FiBookOpen, FiSun, FiMoon, FiCheckSquare, FiClipboard, FiBarChart2,
  FiClock, FiBell, FiSettings, FiUserCheck,
} from 'react-icons/fi';

export const menuItems = [
  { section: 'Overview', items: [
    { label: 'Dashboard', icon: FiHome, path: '/dashboard' },
  ]},
  { section: 'People', items: [
    { label: 'Manage Students', icon: FiUsers, path: '/students' },
    { label: 'Manage Teachers', icon: FiUser, path: '/teachers' },
  ]},
  { section: 'Academics', items: [
    { label: 'Manage Courses', icon: FiBook, path: '/courses' },
    { label: 'Manage Lectures', icon: FiVideo, path: '/lectures' },
    { label: 'Live Sessions', icon: FiRadio, path: '/live-sessions' },
    { label: 'Manage Subjects', icon: FiGrid, path: '/subjects' },
  ]},
  { section: 'Islamic Content', items: [
    { label: 'Quran Content', icon: FiBookOpen, path: '/quran' },
    { label: 'Daily Duas', icon: FiSun, path: '/duas' },
    { label: 'Daily Surah', icon: FiMoon, path: '/daily-surah' },
  ]},
  { section: 'Monitoring', items: [
    { label: 'Attendance', icon: FiCheckSquare, path: '/attendance' },
    { label: 'Enrollments', icon: FiClipboard, path: '/enrollments' },
    { label: 'Reports', icon: FiBarChart2, path: '/reports' },
    { label: 'Activity Logs', icon: FiClock, path: '/activity-logs' },
  ]},
  { section: 'Communication', items: [
    { label: 'Announcements', icon: FiBell, path: '/announcements' },
  ]},
  { section: 'Account', items: [
    { label: 'Settings', icon: FiSettings, path: '/settings' },
    { label: 'Profile', icon: FiUserCheck, path: '/profile' },
  ]},
];