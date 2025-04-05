import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  Typography,
  useTheme,
  Divider,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Home as HomeIcon,
  Map as MapIcon,
  Restaurant as RestaurantIcon,
  Search as SearchIcon,
  Feedback as FeedbackIcon,
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
  Event as EventIcon,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const theme = useTheme();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Hostel & Facility', icon: <HomeIcon />, path: '/hostel-facility' },
    { text: 'Campus Map', icon: <MapIcon />, path: '/map' },
    { text: 'Mess Management', icon: <RestaurantIcon />, path: '/mess' },
    { text: 'Lost & Found', icon: <SearchIcon />, path: '/lost-and-found' },
    { text: 'Feedback', icon: <FeedbackIcon />, path: '/feedback' },
    { text: 'News & Events', icon: <EventIcon />, path: '/news-events' },
    { text: 'Profile', icon: <PersonIcon />, path: '/profile' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: 280,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 280,
          boxSizing: 'border-box',
          bgcolor: theme.palette.background.paper,
          color: theme.palette.text.primary,
          borderRight: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Logo */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
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
              mr: 2,
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
              variant="h6" 
              sx={{ 
                fontWeight: 800,
                background: 'linear-gradient(135deg, #1976D2 0%, #1565C0 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '0.5px',
                mb: 0.5
              }}
            >
              KampusKart
            </Typography>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'text.secondary',
                display: 'block',
                letterSpacing: '0.5px',
                fontSize: '0.75rem',
                fontWeight: 500
              }}
            >
              Your Toolkit for College
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {/* Menu Items */}
        <List>
          {menuItems.map((item) => (
            <ListItem
              button
              key={item.text}
              onClick={() => navigate(item.path)}
              sx={{
                mb: 1,
                borderRadius: 1,
                bgcolor: location.pathname === item.path ? 
                  theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' 
                  : 'transparent',
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
                },
              }}
            >
              <ListItemIcon sx={{ color: location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.primary }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text}
                sx={{ 
                  color: location.pathname === item.path ? theme.palette.primary.main : theme.palette.text.primary
                }}
              />
            </ListItem>
          ))}
        </List>

        <Box sx={{ flexGrow: 1 }} />

        {/* User Profile Section */}
        <Divider sx={{ mb: 2 }} />
        <List>
          <ListItem
            button
            onClick={() => navigate('/profile')}
            sx={{
              borderRadius: 1,
              bgcolor: location.pathname === '/profile' ? 
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' 
                : 'transparent',
            }}
          >
            <ListItemIcon>
              <PersonIcon color={location.pathname === '/profile' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItem>

          <ListItem
            button
            onClick={() => navigate('/settings')}
            sx={{
              borderRadius: 1,
              bgcolor: location.pathname === '/settings' ? 
                theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' 
                : 'transparent',
            }}
          >
            <ListItemIcon>
              <SettingsIcon color={location.pathname === '/settings' ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>

          <ListItem
            button
            onClick={handleLogout}
            sx={{
              borderRadius: 1,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.08)',
              },
            }}
          >
            <ListItemIcon>
              <LogoutIcon color="error" />
            </ListItemIcon>
            <ListItemText primary="Logout" sx={{ color: theme.palette.error.main }} />
          </ListItem>
        </List>

        {/* User Info */}
        {user && (
          <Box sx={{ 
            p: 2, 
            borderRadius: 1,
            bgcolor: theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
            mt: 2,
            overflow: 'hidden'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar 
                src={user?.avatar ? `${process.env.REACT_APP_API_URL?.replace('/api', '')}${user.avatar}` : undefined}
                sx={{ 
                  width: 40, 
                  height: 40,
                  bgcolor: 'primary.main',
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </Avatar>
              <Box sx={{ 
                minWidth: 0,
                flex: 1,
                maxWidth: 180
              }}>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  {user.name}
                </Typography>
                <Typography 
                  variant="caption" 
                  color="text.secondary"
                  sx={{ 
                    display: 'block',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: '100%'
                  }}
                >
                  {user.email}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar; 