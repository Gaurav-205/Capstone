import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleGoogleCallback } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const params = new URLSearchParams(location.search);
        const token = params.get('token');

        if (!token) {
          throw new Error('No token received');
        }

        // Handle the callback with the token
        const response = await handleGoogleCallback(token);
        
        if (response.success) {
          // Navigate to dashboard or stored return path
          const returnTo = sessionStorage.getItem('returnTo') || '/dashboard';
          sessionStorage.removeItem('returnTo'); // Clear stored path
          navigate(returnTo, { replace: true });
        } else {
          throw new Error(response.message || 'Authentication failed');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        navigate('/login?error=auth_failed', { replace: true });
      }
    };

    handleCallback();
  }, [location, navigate, handleGoogleCallback]);

  return (
    <Box
      sx={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2
      }}
    >
      <CircularProgress size={48} />
      <Typography variant="h6" color="textSecondary">
        Completing authentication...
      </Typography>
    </Box>
  );
};

export default AuthCallback;