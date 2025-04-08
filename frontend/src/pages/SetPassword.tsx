import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Paper,
  AlertTitle
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '../services/auth.service';

const schema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain:\n• At least one uppercase letter\n• At least one lowercase letter\n• At least one number\n• At least one special character (@$!%*?&)'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match')
});

interface SetPasswordData {
  password: string;
  confirmPassword: string;
}

interface ErrorState {
  title: string;
  message: string;
  action?: string;
}

const SetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<ErrorState | null>(null);
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SetPasswordData>({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Check if user is authenticated
        if (!authService.isAuthenticated()) {
          setError({
            title: 'Authentication Required',
            message: 'You must be logged in to set your password.',
            action: 'Redirecting to login page...'
          });
          setTimeout(() => navigate('/login'), 3000);
          return;
        }

        try {
          // Get current user data
          const userData = await authService.getCurrentUser();
          
          // If user has already set password, redirect to dashboard
          if (userData && userData.hasSetPassword) {
            setError({
              title: 'Password Already Set',
              message: 'You have already set your password.',
              action: 'Redirecting to dashboard...'
            });
            setTimeout(() => navigate('/dashboard', { replace: true }), 3000);
            return;
          }
        } catch (userErr) {
          console.error('Failed to get user data:', userErr);
          setError({
            title: 'Authentication Error',
            message: 'Failed to verify user data. Please log in again.',
            action: 'Redirecting to login page...'
          });
          setTimeout(() => {
            authService.clearAuth();
            navigate('/login');
          }, 3000);
          return;
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error('Auth check error:', err);
        setError({
          title: 'Authentication Error',
          message: err.response?.data?.message || err.message || 'Failed to verify authentication status.',
          action: 'Redirecting to login page...'
        });
        setTimeout(() => navigate('/login'), 3000);
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (shouldRedirect && redirectCountdown > 0) {
      timer = setInterval(() => {
        setRedirectCountdown(prev => {
          if (prev <= 1) {
            navigate('/dashboard', { replace: true });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [shouldRedirect, redirectCountdown, navigate]);

  const onSubmit = async (data: SetPasswordData) => {
    try {
      setError(null);
      setSuccess('');

      const response = await authService.setPassword(data.password);
      setSuccess('Password set successfully! You can now use either Google or email login.');
      setShouldRedirect(true);
    } catch (err: any) {
      console.error('Set password error:', err);
      setError({
        title: 'Password Setup Failed',
        message: err.message || 'An error occurred while setting the password.',
        action: err.response?.status === 401 ? 'Please try logging in again.' : undefined
      });

      if (err.response?.status === 401) {
        setTimeout(() => navigate('/login'), 3000);
      }
    }
  };

  if (isLoading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%' }}>
          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Set Your Password
          </Typography>
          <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Please set a password for your account to enable both Google and email login.
          </Typography>

          {error && (
            <Alert 
              severity="error" 
              sx={{ 
                width: '100%', 
                mb: 2,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              <AlertTitle>{error.title}</AlertTitle>
              {error.message}
              {error.action && (
                <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                  {error.action}
                </Typography>
              )}
            </Alert>
          )}

          {success && (
            <Alert 
              severity="success" 
              sx={{ 
                width: '100%', 
                mb: 2,
                '& .MuiAlert-message': {
                  width: '100%'
                }
              }}
            >
              <AlertTitle>Success!</AlertTitle>
              {success}
              <Typography variant="body2" sx={{ mt: 1, fontStyle: 'italic' }}>
                Redirecting to dashboard in {redirectCountdown} seconds...
              </Typography>
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="New Password"
              type="password"
              id="password"
              autoComplete="new-password"
              {...register('password')}
              error={!!errors.password}
              helperText={errors.password?.message?.split('\n').map((line, i) => (
                <React.Fragment key={i}>
                  {line}
                  <br />
                </React.Fragment>
              ))}
              disabled={isSubmitting || !!success}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              autoComplete="new-password"
              {...register('confirmPassword')}
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword?.message}
              disabled={isSubmitting || !!success}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isSubmitting || !!success}
            >
              {isSubmitting ? (
                <>
                  <CircularProgress size={24} sx={{ mr: 1 }} />
                  Setting Password...
                </>
              ) : (
                'Set Password'
              )}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SetPassword; 