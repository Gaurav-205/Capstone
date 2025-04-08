import React, { useEffect, ReactNode } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Box, CssBaseline, useTheme, useMediaQuery } from '@mui/material';
import Sidebar from '../components/Sidebar';

interface MainLayoutProps {
  children?: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
      color: theme.palette.text.primary,
      flexDirection: { xs: 'column', sm: 'row' }
    }}>
      <CssBaseline />
      <Sidebar />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          bgcolor: theme.palette.background.default,
          color: theme.palette.text.primary,
          minHeight: '100vh',
          width: { 
            xs: '100%',
            sm: `calc(100% - ${isMobile ? '0px' : '240px'})` 
          },
          ml: { 
            xs: 0,
            sm: isMobile ? 0 : '240px'
          },
          mt: { 
            xs: '56px',
            sm: 0 
          }
        }}
      >
        {children || <Outlet />}
      </Box>
    </Box>
  );
};

export default MainLayout; 