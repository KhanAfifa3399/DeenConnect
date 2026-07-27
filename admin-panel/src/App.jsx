import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import DashboardLayout from './layouts/DashboardLayout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import { PageTitleProvider } from './context/PageTitleContext';
import Subjects from './pages/Subjects/Subjects';
import Students from './pages/Students/Students';
import Teachers from './pages/Teachers/Teachers';
import Courses from './pages/Courses/Courses';
import CourseDetails from './pages/CourseDetails/CourseDetails';
import Enrollments from './pages/Enrollments/Enrollments';
import LiveSessions from './pages/LiveSessions/LiveSessions';
import LecturesOverview from './pages/LecturesOverview/LecturesOverview';
import Attendance from './pages/Attendance/Attendance';
import QuranContent from './pages/QuranContent/QuranContent';
import DailySurah from './pages/DailySurah/DailySurah';
import Duas from './pages/Duas/Duas';
import Announcements from './pages/Announcements/Announcements';
import ActivityLogs from './pages/ActivityLogs/ActivityLogs';
import Reports from './pages/Reports/Reports';
import Profile from './pages/Profile/Profile';
import Settings from './pages/Settings/Settings';
// ...
// ...
// ...
// ...


function App() {
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);


  return (
    <PageTitleProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-color)',
            borderRadius: '10px',
            fontSize: '14px',
            boxShadow: 'var(--shadow-lg)',
          },
          success: {
            iconTheme: { primary: '#2E7D32', secondary: '#fff' },
          },
          error: {
            iconTheme: { primary: '#D32F2F', secondary: '#fff' },
          },
        }}
      />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/subjects" element={<Subjects />} />
            <Route path="/students" element={<Students />} />
            <Route path="/teachers" element={<Teachers />} />
            <Route path="/courses" element={<Courses />} />
            <Route path="/courses/:id" element={<CourseDetails />} />
            <Route path="/enrollments" element={<Enrollments />} />
            <Route path="/live-sessions" element={<LiveSessions />} />
            <Route path="/lectures" element={<LecturesOverview />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/quran" element={<QuranContent />} />
            <Route path="/daily-surah" element={<DailySurah />} />
            <Route path="/duas" element={<Duas />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/activity-logs" element={<ActivityLogs />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </PageTitleProvider>
  );
}

export default App;