import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import LostAndFound from './pages/LostAndFound';
import MessSystem from './pages/MessSystem';
import MessDetailPage from './pages/MessDetailPage';
import AuthCallback from './pages/AuthCallback';
import FeedbackForm from './components/FeedbackForm';
import FeedbackList from './components/FeedbackList';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import LandingPage from './pages/LandingPage';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Logout from './pages/Logout';
import theme from './theme';
import EditFeedback from './components/EditFeedback';
import HostelFacilityInfo from './components/HostelFacilityInfo';
import authService from './services/auth.service';

function App() {
  useEffect(() => {
    authService.initializeAuth();
  }, []);

  return (
    <Router>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/mess" element={<ProtectedRoute><MessSystem /></ProtectedRoute>} />
            <Route path="/mess/:id" element={<ProtectedRoute><MessDetailPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><FeedbackList /></ProtectedRoute>} />
            <Route path="/feedback/new" element={<ProtectedRoute><FeedbackForm /></ProtectedRoute>} />
            <Route path="/feedback/edit/:id" element={<ProtectedRoute><EditFeedback /></ProtectedRoute>} />
            <Route path="/lost-and-found" element={<ProtectedRoute><LostAndFound /></ProtectedRoute>} />
            <Route path="/hostel-facility" element={<ProtectedRoute><HostelFacilityInfo /></ProtectedRoute>} />
            <Route path="/logout" element={<Logout />} />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
