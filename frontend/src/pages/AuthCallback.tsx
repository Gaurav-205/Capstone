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
        // Check if we're in a redirect loop
        const redirectCount = parseInt(sessionStorage.getItem('authRedirectCount') || '0');
        if (redirectCount > 2) {
          throw new Error('Too many authentication redirects. Please try logging in again.');
        }
        sessionStorage.setItem('authRedirectCount', (redirectCount + 1).toString());

        // Get the token from search params or hash
        const searchParams = new URLSearchParams(location.search || location.hash.substring(1));
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
          throw new Error(`Authentication failed: ${error}`);
        }

        if (!token) {
          throw new Error('No authentication token found in URL');
        }

        // Handle the authentication with the received token
        console.log('Handling authentication...');
        await authService.handleGoogleCallback(token);
        
        // Clear redirect count on successful auth
        sessionStorage.removeItem('authRedirectCount');
        
        console.log('Authentication successful');
        setIsProcessing(false);

        // Verify authentication state before redirect
        const isAuthenticated = localStorage.getItem('googleAuthComplete') === 'true';
        if (!isAuthenticated) {
          throw new Error('Authentication state not properly set');
        }

        // Always redirect to dashboard for Google auth users
        console.log('Redirecting to dashboard...');
        navigate('/dashboard', { replace: true });
      } catch (err: any) {
        console.error('Authentication error:', err);
        const errorMessage = err.message || 'Authentication failed. Please try again.';
        console.error('Error message:', errorMessage);
        setError(errorMessage);
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