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
  Paper,
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import authService, { LoginData } from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required')
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const { login } = useAuth();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: LoginData) => {
    try {
      await login(data.email, data.password);
      // Check localStorage for user role after login
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        if (user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/dashboard');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleGoogleLogin = () => {
    try {
      const backendUrl = process.env.REACT_APP_API_URL?.replace('/api', '');
      const googleAuthUrl = `${backendUrl}/api/auth/google`;
      window.location.href = googleAuthUrl;
    } catch (error) {
      setError('Failed to initiate Google login');
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
                fullWidth
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  bgcolor: '#4CAF50',
                  color: '#fff',
                  py: 1.5,
                  '&:hover': {
                    bgcolor: '#388E3C',
                  },
                }}
              >
                Login
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