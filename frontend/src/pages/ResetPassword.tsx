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
  Alert
} from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import authService from '../services/auth.service';

const schema = yup.object().shape({
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match')
});

interface ResetPasswordData {
  password: string;
  confirmPassword: string;
}

const ResetPassword: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<ResetPasswordData>({
    resolver: yupResolver(schema)
  });

  const onSubmit = async (data: ResetPasswordData) => {
    try {
      if (!token) {
        setError('Reset token is missing');
        return;
      }
      const response = await authService.resetPassword(token, data.password);
      setSuccess(response.message);
      setError('');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
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
          Reset Password
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
            label="New Password"
            type="password"
            id="password"
            {...register('password')}
            error={!!errors.password}
            helperText={errors.password?.message}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            {...register('confirmPassword')}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword?.message}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Reset Password
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ResetPassword; 