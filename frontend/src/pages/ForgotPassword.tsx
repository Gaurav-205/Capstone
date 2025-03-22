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
  Alert
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import authService from '../services/auth.service';

const schema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required')
});

interface ForgotPasswordData {
  email: string;
}

const ForgotPassword: React.FC = () => {
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ForgotPasswordData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      const response = await authService.forgotPassword(data.email);
      setSuccess(response.message);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'An error occurred');
      setSuccess('');
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
          Forgot Password
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ width: '100%', mt: 2 }}>
            {success}
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
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Reset Password
          </Button>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              Back to Sign in
            </Link>
          </Box>
        </Box>
      </Box>
    </Container>
  );
};

export default ForgotPassword; 