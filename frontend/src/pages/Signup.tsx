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

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  email: yup.string().email('Invalid email').required('Email is required'),
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

interface SignupFormData extends SignupData {
  confirmPassword: string;
}

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<SignupFormData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const { confirmPassword, ...signupData } = data;
      await authService.signup(signupData);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleGoogleSignup = () => {
    try {
      const backendUrl = process.env.REACT_APP_API_URL?.replace('/api', '');
      const googleAuthUrl = `${backendUrl}/api/auth/google`;
      window.location.href = googleAuthUrl;
    } catch (error) {
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
                helperText={errors.password?.message}
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
                label="Confirm Password"
                {...register('confirmPassword')}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
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