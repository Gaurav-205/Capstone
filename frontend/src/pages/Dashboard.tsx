import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Logout as LogoutIcon, Person as PersonIcon, Search as SearchIcon } from '@mui/icons-material';
import authService from '../services/auth.service';

interface User {
  name: string;
  email: string;
}

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await authService.getCurrentUser();
        if (!response.user) {
          throw new Error('User data not found');
        }
        setUser(response.user);
        setError('');
      } catch (error: any) {
        console.error('Error fetching user data:', error);
        setError(error.response?.data?.message || 'Failed to load user data');
        localStorage.removeItem('token');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleLogout = () => {
    try {
      authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if there's an error
      localStorage.removeItem('token');
      navigate('/login');
    }
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container component="main" maxWidth="md">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}
        >
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
          </Alert>
          <Typography variant="body1">
            Redirecting to login page...
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Avatar
            sx={{
              m: 1,
              bgcolor: 'primary.main',
              width: 80,
              height: 80
            }}
          >
            <PersonIcon fontSize="large" />
          </Avatar>

          <Typography component="h1" variant="h4" sx={{ mt: 2 }}>
            Welcome, {user?.name || 'User'}!
          </Typography>

          <Box sx={{ mt: 3, width: '100%' }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Profile Information
            </Typography>
            <Box sx={{ mt: 2 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {user?.name || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {user?.email || 'N/A'}
              </Typography>
            </Box>
          </Box>

          <Grid container spacing={2} sx={{ mt: 3, width: '100%' }}>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<SearchIcon />}
                onClick={() => navigate('/lost-and-found')}
                fullWidth
              >
                Go to Lost and Found
              </Button>
            </Grid>
            <Grid item xs={12}>
              <Button
                variant="contained"
                color="error"
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
                fullWidth
              >
                Logout
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard; 