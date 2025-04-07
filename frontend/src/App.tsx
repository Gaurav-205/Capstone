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
import FeedbackManagement from './pages/admin/FeedbackManagement';
import PrivateRoute from './components/PrivateRoute';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

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
              <Route path="/admin/feedback" element={<FeedbackManagement />} />
              <Route path="/admin/settings" element={<div>Admin Settings</div>} />
            </Route>

            {/* Protected routes with MainLayout */}
            <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
              <Route path="/hostel-facility" element={<PrivateRoute><Dashboard section="hostel-facility" /></PrivateRoute>} />
              <Route path="/map" element={<PrivateRoute><Dashboard section="map" /></PrivateRoute>} />
              <Route path="/mess" element={<PrivateRoute><Dashboard section="mess" /></PrivateRoute>} />
              <Route path="/lost-and-found" element={<PrivateRoute><Dashboard section="lost-and-found" /></PrivateRoute>} />
              <Route path="/feedback" element={<PrivateRoute><Dashboard section="feedback" /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><Dashboard section="profile" /></PrivateRoute>} />
              <Route path="/news-events" element={<PrivateRoute><NewsAndEventsPage /></PrivateRoute>} />
              <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
              <Route path="/" element={<PrivateRoute><Navigate to="/dashboard" replace /></PrivateRoute>} />
            </Route>

            {/* Protected routes without MainLayout */}
            <Route path="/set-password" element={<PrivateRoute><SetPassword /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

            {/* Redirect root to login */}
            <Route path="/" element={<PrivateRoute><Navigate to="/login" replace /></PrivateRoute>} />

            {/* 404 Route */}
            <Route path="*" element={<PrivateRoute><NotFound /></PrivateRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
