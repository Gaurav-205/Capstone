import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Logout as LogoutIcon, 
  Person as PersonIcon, 
  Search as SearchIcon,
  Restaurant as RestaurantIcon,
  Feedback as FeedbackIcon,
  Home as HomeIcon
} from '@mui/icons-material';
import authService from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';
import CampusMap from '../components/CampusMap';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  }, [navigate, user]);

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
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome, {user?.name}!
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your university life efficiently
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Interactive Campus Map Section */}
        <Grid item xs={12}>
          <CampusMap />
        </Grid>

        {/* Hostel & Facility Information Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Hostel & Facility Information
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              View hostel details, room availability, and campus facilities
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => navigate('/hostel-facility')}
              startIcon={<HomeIcon />}
            >
              View Hostels & Facilities
            </Button>
          </Paper>
        </Grid>

        {/* Mess Management Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Mess Management
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Manage your mess preferences and view meal schedules
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => navigate('/mess')}
              startIcon={<RestaurantIcon />}
            >
              Go to Mess Management
            </Button>
          </Paper>
        </Grid>

        {/* Lost and Found Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Lost and Found
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Report lost items or search for found items
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => navigate('/lost-and-found')}
              startIcon={<SearchIcon />}
            >
              Go to Lost and Found
            </Button>
          </Paper>
        </Grid>

        {/* Feedback & Tracking Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Feedback & Tracking
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Submit feedback, complaints, and track their status
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => navigate('/feedback')}
              startIcon={<FeedbackIcon />}
            >
              Feedback & Tracking
            </Button>
          </Paper>
        </Grid>

        {/* Profile Section */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Profile Settings
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Update your profile information and preferences
            </Typography>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={() => navigate('/profile')}
              startIcon={<PersonIcon />}
            >
              Manage Profile
            </Button>
          </Paper>
        </Grid>

        {/* Logout Button */}
        <Grid item xs={12} md={6}>
          <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
            <Typography variant="h5" gutterBottom>
              Account
            </Typography>
            <Typography variant="body1" color="text.secondary" paragraph>
              Manage your account settings and logout
            </Typography>
            <Button
              variant="contained"
              color="error"
              fullWidth
              onClick={() => navigate('/logout')}
              startIcon={<LogoutIcon />}
            >
              Logout
            </Button>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard; 