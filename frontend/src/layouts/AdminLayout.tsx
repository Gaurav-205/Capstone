import React, { useState } from 'react';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemIcon,
  ListItemText,
  useTheme,
  useMediaQuery,
  Avatar,
  Badge,
  Tooltip,
  Paper,
  Menu,
  MenuItem,
  ListItemButton,
  alpha
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Home as HomeIcon,
  Search as SearchIcon,
  Feedback as FeedbackIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Notifications as NotificationsIcon,
  AccountCircle as AccountCircleIcon,
  Event as EventIcon,
  Restaurant as RestaurantIcon,
  ChevronRight as ChevronRightIcon,
  SupportAgent as SupportIcon,
  Announcement as AnnouncementIcon,
  Article as ArticleIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const drawerWidth = 260;

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notificationsAnchorEl, setNotificationsAnchorEl] = useState<null | HTMLElement>(null);
  const [profileAnchorEl, setProfileAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNotificationsOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNotificationsAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setNotificationsAnchorEl(null);
  };

  const handleProfileOpen = (event: React.MouseEvent<HTMLElement>) => {
    setProfileAnchorEl(event.currentTarget);
  };

  const handleProfileClose = () => {
    setProfileAnchorEl(null);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Users', icon: <PeopleIcon />, path: '/admin/users' },
    { text: 'Hostels', icon: <HomeIcon />, path: '/admin/hostels' },
    { text: 'Lost & Found', icon: <SearchIcon />, path: '/admin/lost-found' },
    { text: 'Feedback', icon: <FeedbackIcon />, path: '/admin/feedback' },
    { text: 'Events', icon: <EventIcon />, path: '/admin/events' },
    { text: 'News', icon: <ArticleIcon />, path: '/admin/news' },
    { text: 'Mess Management', icon: <RestaurantIcon />, path: '/admin/mess' },
    { text: 'Support', icon: <SupportIcon />, path: '/admin/support' },
    { text: 'Settings', icon: <SettingsIcon />, path: '/admin/settings' },
  ];
  
  // Mock notifications
  const notifications = [
    { id: 1, text: 'New user registration', time: '5 minutes ago' },
    { id: 2, text: 'New feedback submitted', time: '30 minutes ago' },
    { id: 3, text: 'Support ticket needs attention', time: '1 hour ago' },
    { id: 4, text: 'System update available', time: '3 hours ago' },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Toolbar sx={{ px: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #2D1B69 0%, #673AB7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(103, 58, 183, 0.3)'
            }}
          >
            <Typography
              variant="h6"
              sx={{
                color: 'white',
                fontWeight: 700,
                fontSize: '1.2rem',
                letterSpacing: '0.5px'
              }}
            >
              KK
            </Typography>
          </Box>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ 
              fontWeight: 700,
              fontSize: '1.25rem',
              letterSpacing: '0.5px',
              background: 'linear-gradient(135deg, #2D1B69 30%, #673AB7 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            KampusKart
          </Typography>
        </Box>
      </Toolbar>
      <Divider />
      
      {/* Admin Profile Section */}
      <Box sx={{ px: 3, py: 2.5, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar 
          src={user?.avatar} 
          alt={user?.name || 'Admin'}
          sx={{ 
            width: 48, 
            height: 48,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '2px solid #fff'
          }}
        />
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
            {user?.name || 'Admin User'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Administrator
          </Typography>
        </Box>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <Typography 
        variant="overline" 
        sx={{ 
          px: 3, 
          mb: 1, 
          fontWeight: 600,
          color: 'text.secondary',
          fontSize: '0.75rem',
          letterSpacing: '0.08em'
        }}
      >
        MAIN NAVIGATION
      </Typography>
      
      <List sx={{ flexGrow: 1, px: 2, overflow: 'auto' }}>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => {
                  navigate(item.path);
                  if (isMobile) setMobileOpen(false);
                }}
                sx={{
                  borderRadius: '10px',
                  px: 2,
                  py: 1,
                  position: 'relative',
                  backgroundColor: active ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
                  color: active ? 'primary.main' : 'text.primary',
                  '&:hover': {
                    backgroundColor: active ? alpha(theme.palette.primary.main, 0.15) : alpha(theme.palette.primary.main, 0.04),
                  },
                  '&::before': active ? {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '20%',
                    height: '60%',
                    width: 4,
                    borderRadius: '0 4px 4px 0',
                    backgroundColor: 'primary.main',
                  } : {},
                }}
              >
                <ListItemIcon 
                  sx={{ 
                    minWidth: 40,
                    color: active ? 'primary.main' : 'inherit',
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text} 
                  primaryTypographyProps={{ 
                    fontWeight: active ? 600 : 500,
                    fontSize: '0.9rem'
                  }}
                />
                {active && <ChevronRightIcon color="primary" fontSize="small" />}
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ mt: 2 }} />
      <Box sx={{ p: 2 }}>
        <ListItem 
          disablePadding
        >
          <ListItemButton
            onClick={logout}
            sx={{
              borderRadius: '10px',
              color: 'error.main',
              '&:hover': {
                backgroundColor: alpha(theme.palette.error.main, 0.08),
              }
            }}
          >
            <ListItemIcon sx={{ minWidth: 40, color: 'error.main' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText 
              primary="Logout" 
              primaryTypographyProps={{ fontWeight: 600 }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          color: 'text.primary',
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{
              fontWeight: 600,
              fontSize: { xs: '1.1rem', sm: '1.25rem' },
              display: { xs: 'none', sm: 'block' }
            }}>
              Admin Panel
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Notifications">
              <IconButton 
                size="large" 
                color="inherit"
                onClick={handleNotificationsOpen}
              >
                <Badge badgeContent={notifications.length} color="error">
                  <NotificationsIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={notificationsAnchorEl}
              open={Boolean(notificationsAnchorEl)}
              onClose={handleNotificationsClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  overflow: 'visible',
                  mt: 1.5,
                  width: 320,
                  borderRadius: '12px',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ p: 2, pb: 1 }}>
                <Typography variant="subtitle1" fontWeight={600}>Notifications</Typography>
                <Typography variant="caption" color="text.secondary">
                  You have {notifications.length} new notifications
                </Typography>
              </Box>
              <Divider />
              {notifications.map((notification) => (
                <MenuItem key={notification.id} onClick={handleNotificationsClose} sx={{ py: 1.5 }}>
                  <Box sx={{ width: '100%' }}>
                    <Typography variant="body2" fontWeight={500}>{notification.text}</Typography>
                    <Typography variant="caption" color="text.secondary">{notification.time}</Typography>
                  </Box>
                </MenuItem>
              ))}
              <Divider />
              <MenuItem 
                onClick={() => {
                  handleNotificationsClose();
                  navigate('/admin/notifications');
                }} 
                sx={{ 
                  py: 1.5, 
                  justifyContent: 'center',
                  color: 'primary.main',
                  fontWeight: 500 
                }}
              >
                View all notifications
              </MenuItem>
            </Menu>
            
            <Tooltip title="Account settings">
              <IconButton 
                size="large"
                edge="end"
                onClick={handleProfileOpen}
              >
                <Avatar 
                  src={user?.avatar} 
                  alt={user?.name || 'Admin'}
                  sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}
                >
                  {user?.name ? user.name[0].toUpperCase() : <AccountCircleIcon />}
                </Avatar>
              </IconButton>
            </Tooltip>
            
            <Menu
              anchorEl={profileAnchorEl}
              open={Boolean(profileAnchorEl)}
              onClose={handleProfileClose}
              PaperProps={{
                elevation: 3,
                sx: {
                  overflow: 'visible',
                  mt: 1.5,
                  width: 200,
                  borderRadius: '12px',
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: 'background.paper',
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0,
                  },
                },
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={() => {
                handleProfileClose();
                navigate('/admin/profile');
              }}>
                Profile
              </MenuItem>
              <MenuItem onClick={() => {
                handleProfileClose();
                navigate('/admin/settings');
              }}>
                Settings
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => {
                handleProfileClose();
                logout();
              }} sx={{ color: 'error.main' }}>
                Logout
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ 
          width: { sm: drawerWidth }, 
          flexShrink: { sm: 0 }
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              boxShadow: '0 0 20px rgba(0,0,0,0.1)',
              border: 'none'
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              boxShadow: '0 0 20px rgba(0,0,0,0.05)',
              border: 'none'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          mt: { xs: '56px', sm: '64px' },
          minHeight: '100vh',
          bgcolor: alpha(theme.palette.primary.main, 0.02),
          overflow: 'hidden'
        }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            minHeight: 'calc(100vh - 64px)',
            borderRadius: 0,
            m: 0,
            p: 0,
            overflow: 'auto'
          }}
        >
          {children}
        </Paper>
      </Box>
    </Box>
  );
};

export default AdminLayout; 