import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
  return (
    <PageTitleProvider>
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
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </PageTitleProvider>
  );
}

export default App;