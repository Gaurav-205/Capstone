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
        // Log all available information
        console.log('Processing authentication callback...');
        console.log('Current URL:', window.location.href);
        console.log('Location state:', location);
        console.log('Search params:', location.search);
        console.log('Hash:', location.hash);

        // Get the token and user info from URL
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');
        const email = searchParams.get('email');
        const name = searchParams.get('name');
        
        console.log('Token present:', !!token);
        console.log('Email:', email);
        console.log('Name:', name);

        if (!token) {
          const error = searchParams.get('error');
          if (error) {
            throw new Error(`Authentication failed: ${error}`);
          }
          throw new Error('No authentication token found in URL');
        }

        // Handle the authentication
        console.log('Calling handleGoogleCallback...');
        await authService.handleGoogleCallback(token);
        
        console.log('Authentication successful, redirecting to dashboard...');
        navigate('/dashboard', { replace: true });
      } catch (err: any) {
        console.error('Authentication error:', err);
        const errorMessage = err.message || 'Authentication failed. Please try again.';
        console.error('Setting error message:', errorMessage);
        setError(errorMessage);
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

  if (!isProcessing) {
    return null; // Don't render anything while redirecting
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
        p: 3
      }}
    >
      <CircularProgress size={48} thickness={4} />
      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          Completing Sign In
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Please wait while we set up your account...
        </Typography>
      </Box>
    </Box>
  );
};

export default AuthCallback; 