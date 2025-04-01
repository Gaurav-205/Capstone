import React, { useEffect, useState } from 'react';
import {
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
  Restaurant as RestaurantIcon, 
  Feedback as FeedbackIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Map as MapIcon,
} from '@mui/icons-material';
import authService from '../services/auth.service';
import { useAuth } from '../contexts/AuthContext';
import CampusMap from '../components/CampusMap';
import HostelFacility from '../components/HostelFacility';
import MessManagement from '../components/MessManagement';
import LostAndFound from '../components/LostAndFound';
import Feedback from '../components/Feedback';
import Profile from './Profile';

type DashboardProps = {
  section?: string;
};

const Dashboard: React.FC<DashboardProps> = ({ section = 'dashboard' }) => {
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

  const handleNavigation = (path: string) => {
    navigate(path);
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
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Alert severity="error" sx={{ width: '100%', maxWidth: 'md', mb: 2 }}>
          {error}
        </Alert>
        <Typography variant="body1">
          Redirecting to login page...
        </Typography>
      </Box>
    );
  }

  const renderContent = () => {
    switch (section) {
      case 'dashboard':
        return (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome, {user?.name}!
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Manage your university life efficiently
              </Typography>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: '#fff'
                  }}
                >
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
                    onClick={() => handleNavigation('/hostel-facility')}
                    startIcon={<HomeIcon />}
                    sx={{
                      py: 1.5,
                      bgcolor: '#4CAF50',
                      '&:hover': {
                        bgcolor: '#388E3C',
                      },
                    }}
                  >
                    View Hostels & Facilities
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: '#fff'
                  }}
                >
                  <Typography variant="h5" gutterBottom>
                    Campus Map
                  </Typography>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    Interactive map with building information and navigation
                  </Typography>
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    onClick={() => handleNavigation('/map')}
                    startIcon={<MapIcon />}
                    sx={{
                      py: 1.5,
                      bgcolor: '#4CAF50',
                      '&:hover': {
                        bgcolor: '#388E3C',
                      },
                    }}
                  >
                    Open Campus Map
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: '#fff'
                  }}
                >
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
                    onClick={() => handleNavigation('/mess')}
                    startIcon={<RestaurantIcon />}
                    sx={{
                      py: 1.5,
                      bgcolor: '#4CAF50',
                      '&:hover': {
                        bgcolor: '#388E3C',
                      },
                    }}
                  >
                    Go to Mess Management
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: '#fff'
                  }}
                >
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
                    onClick={() => handleNavigation('/lost-and-found')}
                    startIcon={<SearchIcon />}
                    sx={{
                      py: 1.5,
                      bgcolor: '#4CAF50',
                      '&:hover': {
                        bgcolor: '#388E3C',
                      },
                    }}
                  >
                    Go to Lost and Found
                  </Button>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper 
                  elevation={0}
                  sx={{ 
                    p: 3, 
                    height: '100%',
                    borderRadius: 2,
                    bgcolor: '#fff'
                  }}
                >
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
                    onClick={() => handleNavigation('/feedback')}
                    startIcon={<FeedbackIcon />}
                    sx={{
                      py: 1.5,
                      bgcolor: '#4CAF50',
                      '&:hover': {
                        bgcolor: '#388E3C',
                      },
                    }}
                  >
                    Feedback & Tracking
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          </>
        );
      
      case 'hostel-facility':
        return <HostelFacility />;

      case 'mess':
        return <MessManagement />;

      case 'lost-and-found':
        return <LostAndFound />;

      case 'feedback':
        return <Feedback />;

      case 'map':
        return <CampusMap />;

      case 'profile':
        return <Profile />;

      case 'settings':
        return (
          <Box>
            <Typography variant="h4" gutterBottom>
              Settings
            </Typography>
            {/* Add your settings content here */}
          </Box>
        );

      default:
        return null;
    }
  };

  return renderContent();
};

export default Dashboard; 