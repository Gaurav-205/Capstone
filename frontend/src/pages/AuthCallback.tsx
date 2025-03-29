import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Button } from '@mui/material';
import axios from 'axios';
import { API_URL } from '../config';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [countdown, setCountdown] = useState(5);
  const mountedRef = useRef(true);
  const timerRef = useRef<NodeJS.Timeout>();
  const redirectTimerRef = useRef<NodeJS.Timeout>();
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const processAuth = async () => {
      try {
        // Prevent multiple redirects
        if (hasRedirectedRef.current) {
          console.log('Already redirected, skipping...');
          return;
        }

        // Get the token from the URL
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const error = params.get('error');
        const needsPassword = params.get('needsPassword') === 'true';

        console.log('Auth callback params:', { token, error, needsPassword });

        if (error) {
          throw new Error(decodeURIComponent(error));
        }

        if (!token) {
          throw new Error('No authentication token found');
        }

        // Verify the token with the backend
        const response = await axios.get(`${API_URL}/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('Auth verification response:', response.data);

        if (!response.data.user) {
          throw new Error('Failed to verify user');
        }

        // Store the token and user info
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(response.data.user));

        // Set the redirect flag
        hasRedirectedRef.current = true;

        // Clear any existing redirect timer
        if (redirectTimerRef.current) {
          clearTimeout(redirectTimerRef.current);
        }

        // Redirect based on needsPassword flag
        const redirectPath = needsPassword ? '/set-password' : '/dashboard';
        console.log('Redirecting to:', redirectPath);

        // Use window.location for more reliable redirection
        window.location.href = redirectPath;

      } catch (err: any) {
        console.error('Authentication error:', err);
        if (mountedRef.current) {
          setError(err.message || 'Authentication failed. Please try again.');
          // Start countdown for redirect
          timerRef.current = setInterval(() => {
            setCountdown(prev => {
              if (prev <= 1) {
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                }
                window.location.href = '/login';
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }
      }
    };

    processAuth();
  }, []); // Remove navigate from dependencies

  if (error) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          p: 3
        }}
      >
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
        <Typography variant="body1" gutterBottom>
          Redirecting to login page in {countdown} seconds...
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => window.location.href = '/login'}
          sx={{ mt: 2 }}
        >
          Go to Login
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
        textAlign: 'center',
        p: 3
      }}
    >
      <CircularProgress size={60} />
      <Typography variant="h6" sx={{ mt: 2 }}>
        Completing authentication...
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
        Please wait while we set up your account...
      </Typography>
    </Box>
  );
};

export default AuthCallback; 