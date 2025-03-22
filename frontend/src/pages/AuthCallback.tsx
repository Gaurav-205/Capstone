import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';
import authService from '../services/auth.service';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [redirectCountdown, setRedirectCountdown] = useState(3);

  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;
    if (error) {
      redirectTimer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            navigate('/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (redirectTimer) {
        clearInterval(redirectTimer);
      }
    };
  }, [error, navigate]);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        setIsLoading(true);
        setError('');

        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        const error = params.get('error');
        const needsPassword = params.get('needs_password');

        if (error) {
          const errorMessage = error === 'auth_failed' 
            ? 'Authentication failed. Please try again.' 
            : decodeURIComponent(error).replace(/_/g, ' ');
          throw new Error(errorMessage);
        }

        if (!token) {
          throw new Error('No authentication token received. Please try again.');
        }

        // Handle the authentication callback
        const userData = await authService.handleGoogleCallback(token);

        // Check if user needs to set password
        if (needsPassword === 'true' || !userData.user.hasSetPassword) {
          navigate('/set-password');
          return;
        }

        // Navigate to dashboard
        navigate('/dashboard');
      } catch (err: any) {
        console.error('Callback error:', err);
        const errorMessage = err.response?.data?.message || err.message || 'An error occurred during authentication';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    handleCallback();
  }, [location, navigate]);

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        gap={2}
        p={3}
      >
        <Alert severity="error" sx={{ maxWidth: 400, width: '100%' }}>
          {error}
        </Alert>
        <Typography variant="body1" color="text.secondary">
          Redirecting to login page in {redirectCountdown} seconds...
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="100vh"
      gap={2}
      p={3}
    >
      <CircularProgress />
      <Typography variant="h6" color="primary">
        Completing authentication...
      </Typography>
      {isLoading && (
        <Typography variant="body2" color="text.secondary">
          Please wait while we set up your account...
        </Typography>
      )}
    </Box>
  );
};

export default AuthCallback; 