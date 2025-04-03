import React, { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Grid,
  Container,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  IconButton,
  Chip,
  Fade,
  LinearProgress,
  Avatar,
  AvatarGroup,
  Stack,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { 
  Restaurant as RestaurantIcon, 
  Feedback as FeedbackIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Map as MapIcon,
  Notifications as NotificationsIcon,
  Assignment as AssignmentIcon,
  ArrowForward as ArrowForwardIcon,
  Event as EventIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  CalendarToday as CalendarIcon,
  LocalLibrary as LibraryIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
  MeetingRoom as MeetingRoomIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import CampusMap from '../components/CampusMap';
import HostelFacility from '../components/HostelFacility';
import MessManagement from '../components/MessManagement';
import LostAndFound from '../components/LostAndFound';
import Feedback from '../components/Feedback';
import Profile from './Profile';
import NewsAndEvents from '../components/NewsAndEvents';
import { lostFoundService } from '../services/lostFoundService';
import feedbackService from '../services/feedbackService';

interface DashboardProps {
  section?: string;
}

interface DashboardStats {
  lostAndFound: {
    totalLost: number;
    totalFound: number;
  };
  events: {
    total: number;
    registered: number;
  };
  feedback: {
    pending: number;
    total: number;
  };
  facilities: {
    available: number;
    total: number;
  };
}

interface QuickAction {
  title: string;
  description: string;
  icon: React.ReactNode;
  action: () => void;
  color: string;
}

const REFRESH_INTERVAL = 30000; // Refresh every 30 seconds

const Dashboard: React.FC<DashboardProps> = ({ section = 'dashboard' }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [stats, setStats] = useState<DashboardStats>({
    lostAndFound: {
      totalLost: 0,
      totalFound: 0
    },
    events: {
      total: 0,
      registered: 0
    },
    feedback: {
      pending: 0,
      total: 0
    },
    facilities: {
      available: 0,
      total: 0
    }
  });
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchDashboardData = useCallback(async () => {
    try {
      // Fetch Lost & Found statistics
      const lostFoundStats = await lostFoundService.getStatistics();
      
      // Fetch feedback statistics
      const feedbackStats = await feedbackService.getStatistics();
      
      // Update statistics
      setStats({
        lostAndFound: {
          totalLost: lostFoundStats.data.activeLostItems,
          totalFound: lostFoundStats.data.activeFoundItems
        },
        events: {
          total: 0,
          registered: 0
        },
        feedback: {
          pending: feedbackStats.data.pending,
          total: feedbackStats.data.total
        },
        facilities: {
          available: 0,
          total: 0
        }
      });

      setLastUpdated(new Date());
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError('Failed to load dashboard data');
        setLoading(false);
      }
  }, []);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Set up automatic refresh
  useEffect(() => {
    const refreshInterval = setInterval(fetchDashboardData, REFRESH_INTERVAL);
    return () => clearInterval(refreshInterval);
  }, [fetchDashboardData]);

  const quickActions: QuickAction[] = [
    {
      title: 'Report Lost Item',
      description: 'Submit a lost item report',
      icon: <SearchIcon />,
      action: () => navigate('/lost-and-found/report'),
      color: '#1976d2',
    },
    {
      title: 'Book Facility',
      description: 'Reserve campus facilities',
      icon: <HomeIcon />,
      action: () => navigate('/hostel-facility'),
      color: '#2e7d32',
    },
    {
      title: 'View Menu',
      description: "Check today's mess menu",
      icon: <RestaurantIcon />,
      action: () => navigate('/mess'),
      color: '#ed6c02',
    },
    {
      title: 'Give Feedback',
      description: 'Share your thoughts',
      icon: <FeedbackIcon />,
      action: () => navigate('/feedback'),
      color: '#9c27b0',
    },
  ];

  const renderDashboardContent = () => (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Welcome Section */}
      <Paper
        elevation={3}
        sx={{
          p: 3,
          mb: 4,
          background: 'linear-gradient(45deg, #1976d2 30%, #2196f3 90%)',
          color: 'white',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '30%',
            height: '100%',
            background: 'linear-gradient(45deg, transparent 0%, rgba(255,255,255,0.1) 100%)',
            transform: 'skewX(-20deg)',
          }}
        />
        <Typography variant="h4" gutterBottom>
          Welcome back, {user?.name}!
        </Typography>
        <Typography variant="subtitle1">
          Here's what's happening in your university life
        </Typography>
        <Typography variant="caption" sx={{ position: 'absolute', bottom: 8, right: 16, opacity: 0.8 }}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </Typography>
      </Paper>

      {/* Quick Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Lost & Found
                  </Typography>
                  <Typography variant="h4">
                    {stats.lostAndFound.totalLost + stats.lostAndFound.totalFound}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats.lostAndFound.totalLost} Lost • {stats.lostAndFound.totalFound} Found
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <SearchIcon />
                </Avatar>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(stats.lostAndFound.totalFound / (stats.lostAndFound.totalLost + stats.lostAndFound.totalFound)) * 100}
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Events
                  </Typography>
                  <Typography variant="h4">
                    {stats.events.total}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    {stats.events.registered} Registered
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <EventIcon />
                </Avatar>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(stats.events.registered / stats.events.total) * 100}
                color="success"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Feedback Status
                  </Typography>
                  <Typography variant="h4">
                    {stats.feedback.pending}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Pending Feedbacks
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <FeedbackIcon />
                </Avatar>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={((stats.feedback.total - stats.feedback.pending) / stats.feedback.total) * 100}
                color="warning"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom>
                    Available Facilities
                  </Typography>
                  <Typography variant="h4">
                    {stats.facilities.available}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Out of {stats.facilities.total} Total
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'info.main' }}>
                  <MeetingRoomIcon />
                </Avatar>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={(stats.facilities.available / stats.facilities.total) * 100}
                color="info"
                sx={{ mt: 2 }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 3,
              borderRadius: 2,
              background: 'linear-gradient(to right bottom, #ffffff, #fafafa)'
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ mb: 3, fontWeight: 'medium' }}>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      bgcolor: 'rgba(25, 118, 210, 0.04)'
                    }
                  }}
                  onClick={() => navigate('/lost-and-found')}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: '#1976d2', width: 48, height: 48 }}>
                        <SearchIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                          Report Lost Item
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Submit a lost item report
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      bgcolor: 'rgba(46, 125, 50, 0.04)'
                    }
                  }}
                  onClick={() => navigate('/hostel-facility')}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: '#2e7d32', width: 48, height: 48 }}>
                        <HomeIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                          Book Facility
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Reserve campus facilities
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      bgcolor: 'rgba(237, 108, 2, 0.04)'
                    }
                  }}
                  onClick={() => navigate('/mess')}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: '#ed6c02', width: 48, height: 48 }}>
                        <RestaurantIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                          View Menu
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Check today's mess menu
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card 
                  sx={{ 
                    height: '100%',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderRadius: 2,
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                      bgcolor: 'rgba(156, 39, 176, 0.04)'
                    }
                  }}
                  onClick={() => navigate('/feedback')}
                >
                  <CardContent sx={{ p: 2.5 }}>
                    <Box display="flex" alignItems="center" gap={2}>
                      <Avatar sx={{ bgcolor: '#9c27b0', width: 48, height: 48 }}>
                        <FeedbackIcon />
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 0.5 }}>
                          Give Feedback
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Share your thoughts
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* News & Events Component */}
      <NewsAndEvents />
    </Container>
  );

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
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

  // Render different sections based on the section prop
    switch (section) {
    case 'hostel-facility':
      return (
        <Fade in timeout={500}>
          <Box>
            <HostelFacility />
          </Box>
        </Fade>
      );
    case 'map':
        return (
        <Fade in timeout={500}>
          <Box>
            <CampusMap />
            </Box>
        </Fade>
      );
      case 'mess':
      return (
        <Fade in timeout={500}>
          <Box>
            <MessManagement />
          </Box>
        </Fade>
      );
      case 'lost-and-found':
      return (
        <Fade in timeout={500}>
          <Box>
            <LostAndFound />
          </Box>
        </Fade>
      );
      case 'feedback':
        return (
        <Fade in timeout={500}>
          <Box>
            <Feedback />
          </Box>
        </Fade>
        );
    case 'profile':
        return (
        <Fade in timeout={500}>
          <Box>
            <Profile />
          </Box>
        </Fade>
        );
    case 'dashboard':
      default:
      return renderDashboardContent();
    }
};

export default Dashboard; 