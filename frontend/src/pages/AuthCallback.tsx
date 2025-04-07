import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import authService from '../services/auth.service';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Clear any existing auth data to prevent state conflicts
        authService.clearAuth();
        
        // Get the token from search params
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Authentication failed: ${error}`);
        }

        if (!token) {
          throw new Error('No authentication token found');
        }

        // Handle the authentication with the received token
        await authService.handleGoogleCallback(token);
        
        // Clear any redirect counts or temporary storage
        sessionStorage.removeItem('authRedirectCount');
        localStorage.removeItem('returnUrl');
        
        // Verify authentication state
        if (!authService.isAuthenticated()) {
          throw new Error('Authentication failed to complete');
        }

        // Get user data
        const userStr = localStorage.getItem('user');
        if (!userStr) {
          throw new Error('User data not found after authentication');
        }

        const user = JSON.parse(userStr);
        
        // Redirect based on user role
        const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
        navigate(redirectPath, { replace: true });
      } catch (err: any) {
        console.error('Authentication error:', err);
        setError(err.message || 'Authentication failed');
        // Clean up any partial auth state
        authService.clearAuth();
      } finally {
        setIsProcessing(false);
      }
    };

    processAuth();
  }, [navigate, location]);

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: 2,
          p: 3,
          bgcolor: 'background.default'
        }}
      >
        <Alert 
          severity="error" 
          sx={{ 
            width: '100%', 
            maxWidth: 400,
            '& .MuiAlert-message': {
              width: '100%'
            }
          }}
        >
          <Typography variant="body1" gutterBottom>
            {error}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please try logging in again.
          </Typography>
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/login', { replace: true })}
          sx={{ 
            mt: 2,
            px: 4,
            py: 1,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '1rem'
          }}
        >
          Return to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: 3,
        bgcolor: 'background.default',
        p: 3,
        opacity: isProcessing ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out'
      }}
    >
      <CircularProgress size={48} thickness={4} />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          {isProcessing ? 'Completing Sign In' : 'Redirecting...'}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isProcessing ? 'Please wait while we set up your account...' : 'Taking you to your dashboard...'}
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthCallback;