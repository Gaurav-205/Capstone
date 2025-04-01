import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, CssBaseline, useTheme } from '@mui/material';
import Sidebar from '../components/Sidebar';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const theme = useTheme();

  useEffect(() => {
    // Store any intervals or timeouts that need cleanup
    const timeouts: NodeJS.Timeout[] = [];
    const intervals: NodeJS.Timeout[] = [];

    // Cleanup function for component unmounting
    return () => {
      // Clear all stored timeouts
      timeouts.forEach(clearTimeout);
      // Clear all stored intervals
      intervals.forEach(clearInterval);
    };
  }, []);

  // Reset scroll position on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <Box sx={{ 
      display: 'flex',
      minHeight: '100vh',
      bgcolor: theme.palette.background.default,
      color: theme.palette.text.primary
    }}>
      <CssBaseline />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
          minHeight: '100vh',
          width: { sm: `calc(100% - 240px)` }
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default MainLayout; 