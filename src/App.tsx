import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import ErrorBoundary from './components/ErrorBoundary';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './components/DashboardLayout';
import TimetablePage from './pages/TimetablePage';

// Mock Dashboards for now
import StudentDashboard from './pages/StudentDashboard';
import TeacherDashboard from './pages/TeacherDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ChangePassword from './pages/ChangePassword';
import ProfilePage from './pages/Profile';
import CalendarPage from './pages/Calendar';
import UserManagement from './pages/UserManagement';
import AnnouncementsManagement from './pages/AnnouncementsManagement';
import RecordAttendance from './pages/RecordAttendance';
import RecordMarks from './pages/RecordMarks';
import AttendancePage from './pages/AttendancePage';
import MarksPage from './pages/MarksPage';
import ExportData from './pages/ExportData';
import StudentFeedback from './pages/StudentFeedback';
import FeedbackMonitor from './pages/FeedbackMonitor';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center font-medium text-slate-500">Loading Academic ERP...</div>;
  if (!user) return <Navigate to="/login" />;

  return <DashboardLayout>{children}</DashboardLayout>;
};

const Home: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  switch (user.role) {
    case 'STUDENT': return <StudentDashboard />;
    case 'TEACHER': return <TeacherDashboard />;
    case 'ADMIN': return <AdminDashboard />;
    default: return <div>Welcome to Academic ERP</div>;
  }
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
              <Route path="/timetable" element={<ProtectedRoute><TimetablePage /></ProtectedRoute>} />
              <Route path="/attendance" element={<ProtectedRoute><AttendancePage /></ProtectedRoute>} />
              <Route path="/marks" element={<ProtectedRoute><MarksPage /></ProtectedRoute>} />
              <Route path="/manage-students" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
              <Route path="/manage-teachers" element={<ProtectedRoute><UserManagement /></ProtectedRoute>} />
              <Route path="/announcements" element={<ProtectedRoute><AnnouncementsManagement /></ProtectedRoute>} />
              <Route path="/export-data" element={<ProtectedRoute><ExportData /></ProtectedRoute>} />
              <Route path="/student-feedback" element={<ProtectedRoute><StudentFeedback /></ProtectedRoute>} />
              <Route path="/feedback-monitor" element={<ProtectedRoute><FeedbackMonitor /></ProtectedRoute>} />
              <Route path="/record-attendance" element={<ProtectedRoute><RecordAttendance /></ProtectedRoute>} />
              <Route path="/record-marks" element={<ProtectedRoute><RecordMarks /></ProtectedRoute>} />
              <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
};

export default App;
