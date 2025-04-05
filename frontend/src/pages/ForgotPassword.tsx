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
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import authService from '../services/auth.service';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
});

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      await authService.forgotPassword(data.email);
      setSuccess('Password reset instructions have been sent to your email');
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
      setSuccess('');
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
            Reset Password
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary', maxWidth: 400 }}>
            Enter your email and we'll send you instructions to reset your password.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
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
                Send Reset Link
              </Button>
            </Stack>
          </form>

          <Typography variant="body2" sx={{ mt: 4, textAlign: 'center', color: 'text.secondary' }}>
            Remember your password?{' '}
            <Link
              component={RouterLink}
              to="/login"
              sx={{
                color: '#4CAF50',
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Back to Login
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPassword; 