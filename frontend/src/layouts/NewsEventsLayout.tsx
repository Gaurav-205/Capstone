import React from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
  useMediaQuery,
} from '@mui/material';

const NewsEventsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      minHeight: '100vh',
      width: '100%'
    }}>
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 1, sm: 2, md: 3 },
          py: { xs: 2, sm: 3 },
          bgcolor: 'background.default',
        }}
      >
        <Container 
          maxWidth="xl"
          sx={{
            px: { xs: 1, sm: 2 },
            mx: 'auto',
            width: '100%'
          }}
        >
          {children}
        </Container>
      </Box>

      {/* Footer */}
      <Box
        component="footer"
        sx={{
          py: { xs: 2, sm: 3 },
          px: { xs: 1, sm: 2 },
          mt: 'auto',
          backgroundColor: theme.palette.grey[100],
          borderTop: `1px solid ${theme.palette.grey[200]}`
        }}
      >
        <Container 
          maxWidth="xl"
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: { xs: 1, sm: 2 }
          }}
        >
          <Typography 
            variant="body2" 
            color="text.secondary"
            align={isMobile ? 'center' : 'left'}
          >
            © {new Date().getFullYear()} KampusKart. All rights reserved.
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            align={isMobile ? 'center' : 'right'}
          >
            Made with ❤️ for MIT ADT University
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default NewsEventsLayout; 