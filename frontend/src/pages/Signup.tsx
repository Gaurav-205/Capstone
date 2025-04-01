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
    .min(6, 'Password must be at least 6 characters')
});

const Signup: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<SignupData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: SignupData) => {
    try {
      await authService.signup(data);
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
          <Box sx={{ mb: 6, display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="Logo"
              sx={{ width: 24, height: 24 }}
            />
            <Typography variant="subtitle1" fontWeight="500">
              Scholarlyfe
            </Typography>
          </Box>

          <Typography variant="h4" component="h1" fontWeight="600" sx={{ mb: 1 }}>
            Hello,
          </Typography>
          <Typography variant="h4" component="h1" fontWeight="600" sx={{ mb: 4 }}>
            Join Campus Life
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
                Sign Up
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
            Already have an account?{' '}
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
              Login
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Signup; 