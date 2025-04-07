import React, { useState } from 'react';
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
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import authService, { SignupData } from '../services/auth.service';
import { API_URL } from '../config';

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&)'
    ),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match')
});

interface SignupFormData extends SignupData {
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<SignupFormData>({
    resolver: yupResolver(schema)
  });

  const password = watch('password');
  const confirmPassword = watch('confirmPassword');

  const onSubmit = async (data: SignupFormData) => {
    try {
      setError('');
      console.log('Starting signup submission...');
      console.log('Environment:', process.env.NODE_ENV);
      console.log('Form data:', { ...data, password: '[REDACTED]' });

      // Show loading state
      const loadingMessage = document.createElement('div');
      loadingMessage.style.position = 'fixed';
      loadingMessage.style.top = '20px';
      loadingMessage.style.left = '50%';
      loadingMessage.style.transform = 'translateX(-50%)';
      loadingMessage.style.backgroundColor = '#1976D2';
      loadingMessage.style.color = 'white';
      loadingMessage.style.padding = '10px 20px';
      loadingMessage.style.borderRadius = '4px';
      loadingMessage.style.zIndex = '9999';
      loadingMessage.textContent = 'Creating your account...';
      document.body.appendChild(loadingMessage);

      const response = await authService.signup({
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        confirmPassword: data.confirmPassword
      });
      
      // Remove loading message
      document.body.removeChild(loadingMessage);
      
      console.log('Signup response:', {
        success: response.success,
        hasUser: !!response.user,
        hasToken: !!response.token,
        message: response.message,
        errors: response.errors
      });

      if (!response.success) {
        let errorMessage: string = response.message || 'An error occurred during signup';
        
        // Handle specific error types
        if (response.errors) {
          if (response.errors.email) {
            errorMessage = 'This email is already registered. Please try logging in or use a different email.';
          } else if (response.errors.password) {
            errorMessage = 'Password does not meet the requirements. Please ensure it has at least 8 characters, including uppercase, lowercase, numbers, and special characters.';
          } else if (response.errors.network) {
            errorMessage = 'Unable to connect to the server. Please check your internet connection and try again.';
          } else if (response.errors.server) {
            errorMessage = `Server error: ${response.errors.server}`;
            if (response.errors.details) {
              console.error('Server error details:', response.errors.details);
            }
          } else if (response.errors.validation) {
            errorMessage = String(response.errors.validation);
          }
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
        
        return;
      }

      // Check if user is authenticated
      const isAuthenticated = authService.isAuthenticated();
      console.log('Authentication status:', { isAuthenticated });

      if (response.success && isAuthenticated) {
        console.log('Signup successful, preparing to navigate...');
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.style.position = 'fixed';
        successMessage.style.top = '20px';
        successMessage.style.left = '50%';
        successMessage.style.transform = 'translateX(-50%)';
        successMessage.style.backgroundColor = '#4CAF50';
        successMessage.style.color = 'white';
        successMessage.style.padding = '10px 20px';
        successMessage.style.borderRadius = '4px';
        successMessage.style.zIndex = '9999';
        successMessage.textContent = 'Account created successfully! Redirecting...';
        document.body.appendChild(successMessage);
        
        // Ensure the auth service has time to set up
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Double check authentication before navigating
        if (authService.isAuthenticated()) {
          console.log('Auth confirmed, navigating to dashboard...');
          document.body.removeChild(successMessage);
          navigate('/dashboard');
          return;
        } else {
          console.log('Authentication status changed, now false');
        }
      }

      // If we get here, something unexpected happened
      console.log('Unexpected signup state, redirecting to login...');
      setError('Account created but automatic login failed. Please try signing in manually.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      console.error('Signup error:', err);
      let errorMessage: string = 'An unexpected error occurred. Please try again.';
      
      if (err.response?.data?.message) {
        errorMessage = String(err.response.data.message);
      } else if (err.message) {
        errorMessage = String(err.message);
      }
      
      setError(errorMessage);
    }
  };

  const handleGoogleSignup = () => {
    try {
      const backendUrl = API_URL.replace('/api', '');
      const googleAuthUrl = `${backendUrl}/auth/google`;
      console.log('Redirecting to:', googleAuthUrl);
      window.location.href = googleAuthUrl;
    } catch (error) {
      console.error('Google signup error:', error);
      setError('Failed to initiate Google signup');
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
          borderTopRightRadius: '2rem',
          borderBottomRightRadius: '2rem',
        }}
      />

      {/* Right side - Form */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
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
            Create Account
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: 400 }}>
            Join our vibrant community of MIT ADT students and access all campus resources in one place.
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
                label="Full Name"
                {...register('name')}
                error={!!errors.name}
                helperText={errors.name?.message}
                disabled={isSubmitting}
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
                label="Email"
                type="email"
                {...register('email')}
                error={!!errors.email}
                helperText={errors.email?.message}
                disabled={isSubmitting}
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
                helperText={
                  errors.password?.message || (
                    showPasswordRequirements ? 
                    'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)' 
                    : undefined
                  )
                }
                disabled={isSubmitting}
                onFocus={() => setShowPasswordRequirements(true)}
                onBlur={() => setShowPasswordRequirements(false)}
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
                label="Confirm Password"
                {...register('confirmPassword')}
                error={Boolean(errors.confirmPassword || (password && confirmPassword && password !== confirmPassword))}
                helperText={errors.confirmPassword?.message || (password && confirmPassword && password !== confirmPassword ? 'Passwords do not match' : undefined)}
                disabled={isSubmitting}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    bgcolor: '#F8F9FA',
                    '&.Mui-focused': {
                      bgcolor: '#fff',
                    }
                  }
                }}
              />

              <Button
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{
                  bgcolor: '#4CAF50',
                  color: '#fff',
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#388E3C',
                  },
                }}
              >
                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
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
                onClick={handleGoogleSignup}
                disabled={isSubmitting}
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

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Already have an account?{' '}
                  <Link
                    component={RouterLink}
                    to="/login"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    Sign in
                  </Link>
                </Typography>
              </Box>
            </Stack>
          </form>
        </Box>
      </Box>
    </Box>
  );
};

export default Signup; 