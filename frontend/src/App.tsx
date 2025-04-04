import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import SetPassword from './pages/SetPassword';
import AuthCallback from './pages/AuthCallback';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import MainLayout from './layouts/MainLayout';
import Settings from './pages/Settings';
import NewsAndEventsPage from './pages/NewsAndEventsPage';
import AdminDashboard from './pages/admin/Dashboard';
import UserManagement from './pages/admin/UserManagement';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Auth routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/set-password" element={<SetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />

            {/* Admin routes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/users" element={<UserManagement />} />
              <Route path="/admin/hostels" element={<div>Hostels Management</div>} />
              <Route path="/admin/lost-found" element={<div>Lost & Found Management</div>} />
              <Route path="/admin/feedback" element={<div>Feedback Management</div>} />
              <Route path="/admin/settings" element={<div>Admin Settings</div>} />
            </Route>

            {/* Protected routes with MainLayout */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/hostel-facility" element={<Dashboard section="hostel-facility" />} />
              <Route path="/map" element={<Dashboard section="map" />} />
              <Route path="/mess" element={<Dashboard section="mess" />} />
              <Route path="/lost-and-found" element={<Dashboard section="lost-and-found" />} />
              <Route path="/feedback" element={<Dashboard section="feedback" />} />
              <Route path="/profile" element={<Dashboard section="profile" />} />
              <Route path="/news-events" element={<NewsAndEventsPage />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
