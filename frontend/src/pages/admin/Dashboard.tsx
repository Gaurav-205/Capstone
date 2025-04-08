import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  IconButton,
  Tooltip,
  Chip,
  Stack,
  Avatar,
  LinearProgress,
  Badge,
  Alert,
  useTheme,
  Tabs,
  Tab,
} from '@mui/material';
import {
  People as PeopleIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Feedback as FeedbackIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Dashboard as DashboardIcon,
  Visibility as VisibilityIcon,
  Restaurant as RestaurantIcon,
  Event as EventIcon,
  SupportAgent as SupportIcon,
  ArrowUpward as ArrowUpwardIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  BarChart as BarChartIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(0);

  // Mock data - replace with actual data from your backend
  const stats = {
    totalUsers: 150,
    activeHostels: 5,
    lostItems: 12,
    feedbackCount: 25,
    pendingIssues: 3,
    messRequests: 8,
    supportTickets: 15,
    events: 7,
    usersGrowth: 12,
    ticketsGrowth: -5,
    feedbackGrowth: 18,
    systemStatus: 'Healthy',
  };

  const recentActivities = [
    { text: 'New user registration', time: '5 minutes ago', type: 'user' },
    { text: 'Lost item reported', time: '15 minutes ago', type: 'lost' },
    { text: 'New feedback submitted', time: '30 minutes ago', type: 'feedback' },
    { text: 'Hostel maintenance request', time: '1 hour ago', type: 'hostel' },
    { text: 'Profile update request', time: '2 hours ago', type: 'profile' },
    { text: 'Support ticket opened', time: '3 hours ago', type: 'support' },
    { text: 'New event created', time: '5 hours ago', type: 'event' },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <PeopleIcon color="primary" />;
      case 'lost':
        return <SearchIcon color="primary" />;
      case 'feedback':
        return <FeedbackIcon color="primary" />;
      case 'hostel':
        return <HomeIcon color="primary" />;
      case 'profile':
        return <PersonIcon color="primary" />;
      case 'support':
        return <SupportIcon color="primary" />;
      case 'event':
        return <EventIcon color="primary" />;
      default:
        return <WarningIcon color="primary" />;
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Header with Welcome Message & Quick Action Buttons */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          mb: 4,
          gap: 2
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.75rem', sm: '2rem' },
              background: 'linear-gradient(135deg, #2D1B69 0%, #673AB7 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 0.5
            }}
          >
            Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Welcome to the KampusKart administrative panel
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <Badge badgeContent={4} color="error" sx={{ mr: 2 }}>
            <IconButton color="primary" size="large">
              <NotificationsIcon />
            </IconButton>
          </Badge>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/users/new')}
            sx={{
              borderRadius: '8px',
              boxShadow: 2,
              textTransform: 'none',
              px: 2,
            }}
          >
            Add New User
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SecurityIcon />}
            onClick={() => navigate('/admin/security')}
            sx={{
              borderRadius: '8px',
              textTransform: 'none',
              px: 2,
            }}
          >
            Security
          </Button>
        </Box>
      </Box>

      {/* System Status Alert */}
      <Alert 
        severity="success" 
        sx={{ 
          mb: 4, 
          borderRadius: '10px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.08)'
        }}
        action={
          <Button color="inherit" size="small" onClick={() => navigate('/admin/system')}>
            View Details
          </Button>
        }
      >
        System Status: {stats.systemStatus} — All services are running properly.
      </Alert>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
              }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'rgba(25, 118, 210, 0.1)',
                borderRadius: '0 0 0 50%',
                zIndex: 0
              }}
            />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.totalUsers}
                  </Typography>
                  <Typography color="textSecondary" sx={{ mb: 2 }}>
                    Total Users
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      icon={<TrendingUpIcon fontSize="small" />}
                      label={`${stats.usersGrowth}%`}
                      color="success"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      vs. last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar 
                  sx={{ 
                    bgcolor: 'primary.light',
                    width: 50,
                    height: 50,
                    boxShadow: '0 4px 14px rgba(25, 118, 210, 0.3)'
                  }}
                >
                  <PeopleIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
              }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'rgba(103, 58, 183, 0.1)',
                borderRadius: '0 0 0 50%',
                zIndex: 0
              }}
            />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.supportTickets}
                  </Typography>
                  <Typography color="textSecondary" sx={{ mb: 2 }}>
                    Support Tickets
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      icon={<TrendingDownIcon fontSize="small" />}
                      label={`${stats.ticketsGrowth}%`}
                      color="error"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      vs. last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar 
                  sx={{ 
                    bgcolor: 'secondary.light',
                    width: 50,
                    height: 50,
                    boxShadow: '0 4px 14px rgba(103, 58, 183, 0.3)'
                  }}
                >
                  <SupportIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
              }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'rgba(218, 165, 32, 0.1)',
                borderRadius: '0 0 0 50%',
                zIndex: 0
              }}
            />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.feedbackCount}
                  </Typography>
                  <Typography color="textSecondary" sx={{ mb: 2 }}>
                    Feedback
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Chip
                      icon={<TrendingUpIcon fontSize="small" />}
                      label={`${stats.feedbackGrowth}%`}
                      color="success"
                      size="small"
                      sx={{ fontWeight: 600 }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      vs. last month
                    </Typography>
                  </Box>
                </Box>
                <Avatar 
                  sx={{ 
                    bgcolor: 'success.light',
                    width: 50,
                    height: 50,
                    boxShadow: '0 4px 14px rgba(218, 165, 32, 0.3)'
                  }}
                >
                  <FeedbackIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card 
            sx={{ 
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
              position: 'relative',
              overflow: 'hidden',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px rgba(0,0,0,0.12)',
              }
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '80px',
                height: '80px',
                background: 'rgba(255, 20, 147, 0.1)',
                borderRadius: '0 0 0 50%',
                zIndex: 0
              }}
            />
            <CardContent sx={{ position: 'relative', zIndex: 1 }}>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {stats.pendingIssues}
                  </Typography>
                  <Typography color="textSecondary" sx={{ mb: 2 }}>
                    Pending Issues
                  </Typography>
                  <LinearProgress 
                    variant="determinate" 
                    value={30} 
                    color="error"
                    sx={{ 
                      height: 8, 
                      borderRadius: 4,
                      mb: 1,
                      bgcolor: 'rgba(255, 20, 147, 0.1)'
                    }} 
                  />
                  <Typography variant="caption" color="text.secondary">
                    Requires attention
                  </Typography>
                </Box>
                <Avatar 
                  sx={{ 
                    bgcolor: 'error.light',
                    width: 50,
                    height: 50,
                    boxShadow: '0 4px 14px rgba(255, 20, 147, 0.3)'
                  }}
                >
                  <WarningIcon />
                </Avatar>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Category Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ mb: 2 }}
        variant="fullWidth"
        TabIndicatorProps={{
          style: {
            backgroundColor: theme.palette.primary.main,
            height: 3,
            borderRadius: '2px'
          }
        }}
      >
        <Tab 
          label="Overview" 
          icon={<DashboardIcon />} 
          iconPosition="start" 
          sx={{ 
            textTransform: 'none', 
            fontWeight: 600,
            fontSize: '1rem'
          }} 
        />
        <Tab 
          label="Users" 
          icon={<PeopleIcon />} 
          iconPosition="start" 
          sx={{ 
            textTransform: 'none', 
            fontWeight: 600,
            fontSize: '1rem'
          }} 
        />
        <Tab 
          label="Facilities" 
          icon={<HomeIcon />} 
          iconPosition="start" 
          sx={{ 
            textTransform: 'none', 
            fontWeight: 600,
            fontSize: '1rem'
          }} 
        />
        <Tab 
          label="Services" 
          icon={<RestaurantIcon />} 
          iconPosition="start" 
          sx={{ 
            textTransform: 'none', 
            fontWeight: 600,
            fontSize: '1rem'
          }} 
        />
      </Tabs>

      {/* Main Content */}
      <Grid container spacing={3}>
        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600 }}>Recent Activities</Typography>
              <Button 
                size="small" 
                color="primary"
                endIcon={<VisibilityIcon />}
                sx={{ textTransform: 'none' }}
              >
                View All
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />
            <List sx={{ flex: 1, overflowY: 'auto', maxHeight: 380 }}>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem sx={{ py: 1.5, px: 1, borderRadius: '8px', '&:hover': { bgcolor: 'action.hover' } }}>
                    <ListItemIcon sx={{ minWidth: 42 }}>
                      <Avatar 
                        sx={{ 
                          width: 36, 
                          height: 36, 
                          bgcolor: `${activity.type === 'warning' ? 'error.light' : 'primary.lighter'}`,
                          color: `${activity.type === 'warning' ? 'error.main' : 'primary.main'}`
                        }}
                      >
                        {getActivityIcon(activity.type)}
                      </Avatar>
                    </ListItemIcon>
                    <ListItemText 
                      primary={
                        <Typography variant="body1" fontWeight={500}>
                          {activity.text}
                        </Typography>
                      } 
                      secondary={
                        <Typography variant="caption" color="text.secondary">
                          {activity.time}
                        </Typography>
                      } 
                    />
                    <Tooltip title="View details">
                      <IconButton size="small">
                        <VisibilityIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper 
            sx={{ 
              p: 3, 
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
              height: '100%'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Quick Actions
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/admin/users')}
                  sx={{ 
                    p: 1.5, 
                    justifyContent: 'flex-start',
                    borderRadius: '10px',
                    boxShadow: '0 4px 14px rgba(25, 118, 210, 0.2)',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Manage Users
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="secondary"
                  startIcon={<HomeIcon />}
                  onClick={() => navigate('/admin/hostels')}
                  sx={{ 
                    p: 1.5, 
                    justifyContent: 'flex-start',
                    borderRadius: '10px',
                    boxShadow: '0 4px 14px rgba(103, 58, 183, 0.2)',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Manage Hostels
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="success"
                  startIcon={<SearchIcon />}
                  onClick={() => navigate('/admin/lost-found')}
                  sx={{ 
                    p: 1.5, 
                    justifyContent: 'flex-start',
                    borderRadius: '10px',
                    boxShadow: '0 4px 14px rgba(218, 165, 32, 0.2)',
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: 'success.main'
                  }}
                >
                  Lost & Found
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="warning"
                  startIcon={<FeedbackIcon />}
                  onClick={() => navigate('/admin/feedback')}
                  sx={{ 
                    p: 1.5, 
                    justifyContent: 'flex-start',
                    borderRadius: '10px',
                    boxShadow: '0 4px 14px rgba(255, 127, 80, 0.2)',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  View Feedback
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  startIcon={<RestaurantIcon />}
                  onClick={() => navigate('/admin/mess')}
                  sx={{ 
                    p: 1.5, 
                    justifyContent: 'flex-start',
                    borderRadius: '10px',
                    boxShadow: '0 4px 14px rgba(255, 127, 80, 0.2)',
                    textTransform: 'none',
                    fontWeight: 600,
                    bgcolor: '#FF7F50'
                  }}
                >
                  Mess Management
                </Button>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Button
                  fullWidth
                  variant="contained"
                  color="error"
                  startIcon={<EventIcon />}
                  onClick={() => navigate('/admin/events')}
                  sx={{ 
                    p: 1.5, 
                    justifyContent: 'flex-start',
                    borderRadius: '10px',
                    boxShadow: '0 4px 14px rgba(255, 20, 147, 0.2)',
                    textTransform: 'none',
                    fontWeight: 600
                  }}
                >
                  Manage Events
                </Button>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 3, pt: 2, borderTop: '1px dashed #e0e0e0' }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1.5 }}>
                System Shortcuts
              </Typography>
              <Stack direction="row" spacing={1}>
                <Chip 
                  icon={<BarChartIcon />} 
                  label="Reports" 
                  clickable 
                  onClick={() => navigate('/admin/reports')}
                  sx={{ 
                    borderRadius: '8px',
                    fontWeight: 500,
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }
                  }}
                />
                <Chip 
                  icon={<SecurityIcon />} 
                  label="Security" 
                  clickable 
                  onClick={() => navigate('/admin/security')}
                  sx={{ 
                    borderRadius: '8px',
                    fontWeight: 500,
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }
                  }}
                />
                <Chip 
                  icon={<SettingsIcon />} 
                  label="Settings" 
                  clickable
                  onClick={() => navigate('/admin/settings')}
                  sx={{ 
                    borderRadius: '8px',
                    fontWeight: 500,
                    '&:hover': {
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    }
                  }}
                />
              </Stack>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 