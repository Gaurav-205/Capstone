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
    window.location.href = 'http://localhost:5000/api/auth/google';
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
          Sign up
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
            id="name"
            label="Full Name"
            autoComplete="name"
            autoFocus
            {...register('name')}
            error={!!errors.name}
            helperText={errors.name?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            autoComplete="email"
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
            autoComplete="new-password"
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
            Sign Up
          </Button>

          <Divider sx={{ my: 2 }}>OR</Divider>

          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignup}
            sx={{ mb: 2 }}
          >
            Sign up with Google
          </Button>

          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign in
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default Signup; 