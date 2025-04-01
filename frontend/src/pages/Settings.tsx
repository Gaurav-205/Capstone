import React from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Switch,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  useTheme as useMuiTheme,
} from '@mui/material';
import {
  DarkMode as DarkModeIcon,
  Notifications as NotificationsIcon,
  Language as LanguageIcon,
  Visibility as VisibilityIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

const Settings = () => {
  const { darkMode, toggleDarkMode } = useTheme();
  const muiTheme = useMuiTheme();

  const ComingSoonSection = ({ icon, title }: { icon: React.ReactNode; title: string }) => (
    <>
      <ListItem>
        <ListItemIcon>
          {icon}
        </ListItemIcon>
        <ListItemText 
          primary={title}
          secondary="Coming Soon"
        />
        <ListItemSecondaryAction>
          <Switch
            edge="end"
            disabled
          />
        </ListItemSecondaryAction>
      </ListItem>
      <Divider />
    </>
  );

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          Customize your app experience
        </Typography>
      </Box>

      <Paper 
        elevation={3} 
        sx={{ 
          p: 3,
          bgcolor: muiTheme.palette.background.paper,
          color: muiTheme.palette.text.primary
        }}
      >
        <List>
          {/* Dark Mode - Functional */}
          <ListItem>
            <ListItemIcon>
              <DarkModeIcon color={darkMode ? "primary" : "inherit"} />
            </ListItemIcon>
            <ListItemText 
              primary="Dark Mode" 
              secondary="Toggle dark/light theme"
            />
            <ListItemSecondaryAction>
              <Switch
                edge="end"
                checked={darkMode}
                onChange={toggleDarkMode}
              />
            </ListItemSecondaryAction>
          </ListItem>
          
          <Divider />

          {/* Coming Soon Features */}
          <ComingSoonSection 
            icon={<NotificationsIcon />} 
            title="Notifications" 
          />

          <ComingSoonSection 
            icon={<LanguageIcon />} 
            title="Language" 
          />

          <ComingSoonSection 
            icon={<VisibilityIcon />} 
            title="Privacy Mode" 
          />

          <ComingSoonSection 
            icon={<SecurityIcon />} 
            title="Two-Factor Authentication" 
          />
        </List>
      </Paper>
    </Container>
  );
};

export default Settings; 