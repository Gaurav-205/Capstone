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
  Paper
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
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
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

const SetPassword: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [redirectCountdown, setRedirectCountdown] = useState(2);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SetPasswordData>({
    resolver: yupResolver(schema)
  });

  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;
    if (shouldRedirect) {
      redirectTimer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            navigate('/dashboard');
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
  }, [shouldRedirect, navigate]);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true);
        setError('');

        // Check if we have a token in the URL (for direct navigation after OAuth)
        const params = new URLSearchParams(location.search);
        const token = params.get('token');
        if (token) {
          await authService.handleGoogleCallback(token);
        }

        if (!authService.isAuthenticated()) {
          setError('Please log in to set your password');
          setShouldRedirect(true);
          return;
        }

        const userData = await authService.getCurrentUser();
        if (userData.user.hasSetPassword) {
          setShouldRedirect(true);
          return;
        }

        setIsLoading(false);
      } catch (err: any) {
        console.error('Auth check error:', err);
        const errorMessage = err.response?.data?.message || err.message || 'Authentication error';
        setError(errorMessage);
        setShouldRedirect(true);
      }
    };

    checkAuth();
  }, [location]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (shouldRedirect) {
      timer = setTimeout(() => {
        if (error) {
          navigate('/login');
        } else {
          navigate('/dashboard');
        }
      }, 3000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [shouldRedirect, error, navigate]);

  const onSubmit = async (data: SetPasswordData) => {
    try {
      setError('');
      setSuccess('');

      const response = await authService.setPassword(data.password);
      setSuccess(response.message || 'Password set successfully');
      setShouldRedirect(true);
    } catch (err: any) {
      console.error('Set password error:', err);
      setError(err.response?.data?.message || err.message || 'An error occurred while setting the password');
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
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ width: '100%', mb: 2 }}>
              {success}
              <Typography variant="body2" sx={{ mt: 1 }}>
                Redirecting to dashboard in {redirectCountdown} seconds...
              </Typography>
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit(onSubmit)}>
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
              helperText={errors.password?.message}
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