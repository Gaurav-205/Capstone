import React from 'react';
import {
  Box,
  Container,
  Typography,
  useTheme,
} from '@mui/material';

const NewsEventsLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const theme = useTheme();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          px: { xs: 2, sm: 3 },
          pb: 3,
          bgcolor: 'background.default',
        }}
      >
        <Container maxWidth="xl">
          {children}
        </Container>
      </Box>

      {/* Simple Footer */}
      <Box
        component="footer"
        sx={{
          py: 3,
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.grey[100],
        }}
      >
        <Container maxWidth="xl">
          <Typography variant="body2" color="text.secondary" align="center">
            © {new Date().getFullYear()} ScholarlyFe. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default NewsEventsLayout; 