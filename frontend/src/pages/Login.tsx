import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Alert,
  Stack,
  Divider,
  Paper,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import authService, { LoginData } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required')
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { login, isAuthenticated } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginData>({
    resolver: yupResolver(schema)
  });

  // Clean up URL and check auth state on mount
  useEffect(() => {
    // Clear any stale auth data
    if (location.search.includes('error')) {
      const params = new URLSearchParams(location.search);
      const errorMsg = params.get('error');
      setError(decodeURIComponent(errorMsg || 'Authentication failed'));
      // Clean URL
      window.history.replaceState({}, document.title, '/login');
    }
    
    // If user is already authenticated, redirect to appropriate page
    if (isAuthenticated) {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        const redirectPath = user.role === 'admin' ? '/admin/dashboard' : '/dashboard';
        navigate(redirectPath, { replace: true });
      }
    }
  }, [location, navigate, isAuthenticated]);

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    setError('');
    
    // Clear any redirect parameter from URL to prevent looping
    if (window.location.search.includes('redirect')) {
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    try {
      console.log('Starting login process...');
      console.log('API URL:', process.env.REACT_APP_API_URL);
      console.log('Login data:', { email: data.email, passwordLength: data.password?.length });
      
      // Call the login function from auth context
      await login(data.email, data.password);
      
      // Only proceed with navigation if login was successful
      console.log('Login successful, checking user role...');
      
      // Check localStorage for user role after login
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        console.log('User role:', user.role);
        if (user.role === 'admin') {
          console.log('Navigating to admin dashboard...');
          navigate('/admin/dashboard');
        } else {
          console.log('Navigating to user dashboard...');
          navigate('/dashboard');
        }
      } else {
        console.log('No user data found in localStorage');
        setError('Login successful but user data not found');
      }
    } catch (err: any) {
      console.error('Login error details:', {
        error: err,
        response: err.response,
        message: err.message,
        status: err.response?.status
      });

      let errorMessage = '';
      
      // Check if the error has a response with data from the auth service
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message?.includes('timeout') || err.message?.includes('Failed to connect')) {
        errorMessage = 'Unable to reach the server. The server might be starting up, please wait a moment and try again.';
        // Increment retry count for timeout errors
        setRetryCount(prev => prev + 1);
      } else if (err.response?.status === 401) {
        errorMessage = 'Invalid email or password. Please check your credentials and try again.';
      } else if (err.response?.status === 404) {
        errorMessage = 'Login service is currently unavailable. Please try again later.';
      } else if (err.response?.data?.errors?.auth) {
        errorMessage = err.response.data.errors.auth;
      } else if (err.response?.data?.errors?.server) {
        errorMessage = err.response.data.errors.server;
      } else {
        errorMessage = err.message || 'An error occurred during login';
      }

      // Add retry suggestion if we've had multiple timeouts
      if (retryCount >= 2) {
        errorMessage += ' The server might be taking longer than usual to start. Please wait a minute before trying again.';
      }

      setError(errorMessage);
      
      // Show error in a more visible way
      const errorElement = document.createElement('div');
      errorElement.style.position = 'fixed';
      errorElement.style.top = '20px';
      errorElement.style.left = '50%';
      errorElement.style.transform = 'translateX(-50%)';
      errorElement.style.backgroundColor = '#f44336';
      errorElement.style.color = 'white';
      errorElement.style.padding = '15px 25px';
      errorElement.style.borderRadius = '4px';
      errorElement.style.zIndex = '9999';
      errorElement.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      errorElement.textContent = errorMessage;
      document.body.appendChild(errorElement);

      // Remove error message after 5 seconds
      setTimeout(() => {
        document.body.removeChild(errorElement);
      }, 5000);
      
      // Prevent form submission and navigation
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    try {
      // Clear any existing auth data before starting new auth flow
      localStorage.removeItem('googleAuthComplete');
      localStorage.removeItem('returnUrl');
      sessionStorage.removeItem('authRedirectCount');
      
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const googleAuthUrl = `${apiUrl}/auth/google`;
      
      // Redirect to Google auth
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error('Google login error:', error);
      setError('Failed to initiate Google login. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: '#fff',
      }}
    >
      {/* Left side - Image */}
      <Box
        sx={{
          width: '50%',
          display: { xs: 'none', md: 'block' },
          backgroundImage: 'url(/images/nature-leaves.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          // borderTopRightRadius: '2rem',
          // borderBottomRightRadius: '2rem',
          // borderTopLeftRadius: '2rem',
          // borderBottomLeftRadius: '2rem',
        }}
      />

      {/* Right side - Form */}
      <Box
        sx={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 4, md: 8 },
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '400px',
          }}
        >
          <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: '12px',
                background: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                },
                overflow: 'hidden'
              }}
            >
              <Box
                component="img"
                src="/images/logo.png"
                alt="KampusKart Logo"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  p: 0.5
                }}
              />
            </Box>
            <Box>
              <Typography 
                variant="h5" 
                sx={{ 
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  letterSpacing: '0.5px',
                  mb: 0.5
                }}
              >
                KampusKart
              </Typography>
              <Typography 
                variant="caption" 
                sx={{ 
                  color: 'text.secondary',
                  display: 'block',
                  letterSpacing: '0.5px',
                  fontSize: '0.75rem',
                  fontWeight: 500
                }}
              >
                Your Toolkit for College
              </Typography>
            </Box>
          </Box>

          <Typography variant="h3" component="h1" gutterBottom sx={{ 
            fontWeight: 800, 
            letterSpacing: '0.5px',
            background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Welcome Back
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: 400 }}>
            A modern, vibrant web portal designed for MIT ADT students, faculty, and visitors.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#F8F9FA',
                    '&.Mui-focused': {
                      bgcolor: '#fff',
                    }
                  }
                }}
              />
              
              <TextField
                fullWidth
                type="password"
                label="Password"
                {...register('password')}
                error={!!errors.password}
                helperText={errors.password?.message}
                disabled={isLoading}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#F8F9FA',
                    '&.Mui-focused': {
                      bgcolor: '#fff',
                    }
                  }
                }}
              />

              <Box sx={{ textAlign: 'right' }}>
                <Link
                  component={RouterLink}
                  to="/forgot-password"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  Forgot your password?
                </Link>
              </Box>

              <Button
                type="submit"
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
                  '&:hover': {
                    transform: 'translateY(-1px)',
                    boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
                  },
                }}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </Button>

              <Box sx={{ position: 'relative', my: 1 }}>
                <Divider>
                  <Typography variant="body2" sx={{ px: 2, color: 'text.secondary' }}>
                    or
                  </Typography>
                </Divider>
              </Box>

              <Button
                fullWidth
                variant="outlined"
                size="large"
                onClick={handleGoogleLogin}
                startIcon={<GoogleIcon />}
                sx={{
                  py: 1.5,
                  color: 'text.primary',
                  borderColor: '#E0E0E0',
                  bgcolor: '#fff',
                  '&:hover': {
                    bgcolor: '#F8F9FA',
                    borderColor: '#E0E0E0',
                  }
                }}
              >
                Continue with Google
              </Button>
            </Stack>
          </form>

          <Typography variant="body2" sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
            Don't have an account?{' '}
            <Link
              component={RouterLink}
              to="/signup"
              sx={{
                color: '#4CAF50',
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Sign up
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login; 