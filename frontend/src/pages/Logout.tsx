import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Paper,
} from '@mui/material';
import authService from '../services/auth.service';

const Logout: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await authService.logout();
        localStorage.removeItem('token');
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } catch (error) {
        console.error('Logout error:', error);
        // Force logout even if there's an error
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper elevation={3} sx={{ p: 4, width: '100%', textAlign: 'center' }}>
          <CircularProgress sx={{ mb: 2 }} />
          <Typography variant="h5" component="h1" gutterBottom>
            Logging out...
          </Typography>
          <Typography variant="body1" color="text.secondary">
            You will be redirected to the login page shortly.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
};

export default Logout; 