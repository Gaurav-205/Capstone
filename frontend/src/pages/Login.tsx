import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
  Alert
} from '@mui/material';
import { Google as GoogleIcon } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import authService, { LoginData } from '../services/auth.service';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required')
});

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: LoginData) => {
    try {
      await authService.login(data);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
    }
  };

  const handleGoogleLogin = () => {
    try {
      window.location.href = 'http://localhost:5000/api/auth/google';
    } catch (error) {
      setError('Failed to initiate Google login');
    }
  };

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
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            autoComplete="email"
            autoFocus
            {...register('email')}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>

          <Divider sx={{ my: 2 }}>OR</Divider>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{ mb: 2 }}
          >
            Sign in with Google
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Link component={RouterLink} to="/forgot-password" variant="body2">
              Forgot password?
            </Link>
            <Link component={RouterLink} to="/signup" variant="body2">
              Don't have an account? Sign Up
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Login; 