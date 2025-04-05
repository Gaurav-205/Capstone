import React from 'react';
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
} from '@mui/material';
import {
  People as PeopleIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Feedback as FeedbackIcon,
  Warning as WarningIcon,
  Settings as SettingsIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock data - replace with actual data from your backend
  const stats = {
    totalUsers: 150,
    activeHostels: 5,
    lostItems: 12,
    feedbackCount: 25,
    pendingIssues: 3,
  };

  const recentActivities = [
    { text: 'New user registration', time: '5 minutes ago', type: 'user', priority: 'high' },
    { text: 'Lost item reported', time: '15 minutes ago', type: 'lost', priority: 'medium' },
    { text: 'New feedback submitted', time: '30 minutes ago', type: 'feedback', priority: 'low' },
    { text: 'Hostel maintenance request', time: '1 hour ago', type: 'hostel', priority: 'high' },
    { text: 'Profile update request', time: '2 hours ago', type: 'profile', priority: 'low' },
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
      default:
        return <WarningIcon color="primary" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '12px',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(25, 118, 210, 0.25)',
              transition: 'all 0.3s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 16px rgba(25, 118, 210, 0.3)',
              },
              overflow: 'hidden'
            }}
          >
            <Box
              component="img"
              src="/images/logo.png"
              alt="KampusKart Logo"
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                p: 0.5
              }}
            />
          </Box>
          <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.5px'
              }}
            >
              Admin Dashboard
            </Typography>
            <Typography 
              variant="subtitle2" 
              sx={{ 
                color: 'text.secondary',
                letterSpacing: '0.5px',
                fontWeight: 500
              }}
            >
              Manage your campus resources
            </Typography>
          </Box>
        </Box>
        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => navigate('/admin/users/new')}
          >
            Add New User
          </Button>
          <Button
            variant="outlined"
            color="primary"
            startIcon={<SecurityIcon />}
            onClick={() => navigate('/admin/security')}
          >
            Security Settings
          </Button>
        </Stack>
      </Box>

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <PeopleIcon color="primary" sx={{ mr: 1, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.totalUsers}
                  </Typography>
                  <Typography color="textSecondary">Total Users</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <HomeIcon color="primary" sx={{ mr: 1, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.activeHostels}
                  </Typography>
                  <Typography color="textSecondary">Active Hostels</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <SearchIcon color="primary" sx={{ mr: 1, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.lostItems}
                  </Typography>
                  <Typography color="textSecondary">Lost Items</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <FeedbackIcon color="primary" sx={{ mr: 1, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.feedbackCount}
                  </Typography>
                  <Typography color="textSecondary">Feedback</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ bgcolor: '#f8f9fa' }}>
            <CardContent>
              <Box display="flex" alignItems="center">
                <WarningIcon color="error" sx={{ mr: 1, fontSize: 40 }} />
                <Box>
                  <Typography variant="h4" component="div">
                    {stats.pendingIssues}
                  </Typography>
                  <Typography color="textSecondary">Pending Issues</Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Recent Activities */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">Recent Activities</Typography>
              <Button size="small" color="primary">
                View All
              </Button>
            </Box>
            <List>
              {recentActivities.map((activity, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemIcon>{getActivityIcon(activity.type)}</ListItemIcon>
                    <ListItemText
                      primary={activity.text}
                      secondary={activity.time}
                    />
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip
                        label={activity.priority}
                        size="small"
                        color={getPriorityColor(activity.priority)}
                      />
                      <Tooltip title="Edit">
                        <IconButton size="small" color="primary">
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton size="small" color="error">
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </ListItem>
                  {index < recentActivities.length - 1 && <Divider />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PeopleIcon />}
                  onClick={() => navigate('/admin/users')}
                >
                  Manage Users
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<HomeIcon />}
                  onClick={() => navigate('/admin/hostels')}
                >
                  Manage Hostels
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SearchIcon />}
                  onClick={() => navigate('/admin/lost-found')}
                >
                  Lost & Found
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<FeedbackIcon />}
                  onClick={() => navigate('/admin/feedback')}
                >
                  View Feedback
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<PersonIcon />}
                  onClick={() => navigate('/admin/profiles')}
                >
                  User Profiles
                </Button>
              </Grid>
              <Grid item xs={6}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<SettingsIcon />}
                  onClick={() => navigate('/admin/settings')}
                >
                  System Settings
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard; 