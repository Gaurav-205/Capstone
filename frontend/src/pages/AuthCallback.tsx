import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import authService from '../services/auth.service';

const AuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const redirectTimerRef = useRef<NodeJS.Timeout>();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processAuth = async () => {
      try {
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');
        const needsPassword = searchParams.get('needsPassword') === 'true';
        const error = searchParams.get('error');

        if (error) {
          throw new Error(decodeURIComponent(error));
        }

        if (!token) {
          throw new Error('No authentication token found');
        }

        // Store the token and get user data
        await authService.handleGoogleCallback(token);
        
        // Set a timer for redirection
        const timer = setTimeout(() => {
          if (needsPassword) {
            navigate('/set-password');
          } else {
            navigate('/dashboard');
          }
        }, 2000);
        
        redirectTimerRef.current = timer;
      } catch (err: any) {
        console.error('Authentication error:', err);
        setError(err.message || 'Authentication failed. Please try again.');
      }
    };

    processAuth();

    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, [location.search, navigate]);

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
          p: 3
        }}
      >
        <Alert severity="error" sx={{ width: '100%', maxWidth: 400 }}>
          {error}
        </Alert>
        <Button
          variant="contained"
          onClick={() => navigate('/login')}
          sx={{ mt: 2 }}
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
        gap: 2
      }}
    >
      <CircularProgress />
      <Typography>Completing authentication...</Typography>
      <Typography variant="body2" color="text.secondary">
        Please wait while we set up your account...
      </Typography>
    </Box>
  );
};

export default AuthCallback; 