import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Grid,
  Paper,
} from '@mui/material';
import { 
  School as SchoolIcon, 
  Restaurant as RestaurantIcon, 
  Feedback as FeedbackIcon,
  Home as HomeIcon 
} from '@mui/icons-material';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          position: 'relative',
          overflow: 'hidden',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(123, 31, 162, 0.9) 30%, rgba(74, 20, 140, 0.9) 90%)',
            zIndex: 1
          }
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2 }}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            mb: 4
          }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: '20px',
                bgcolor: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
                mr: 2
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: '2rem',
                  letterSpacing: '1px'
                }}
              >
                KK
              </Typography>
            </Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 700,
                background: 'linear-gradient(45deg, #ffffff 30%, #e0e0e0 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                letterSpacing: '1px'
              }}
            >
              KampusKart
            </Typography>
          </Box>
          <Typography
            variant="h4"
            sx={{
              color: 'white',
              mb: 3,
              textAlign: 'center',
              fontWeight: 500,
              letterSpacing: '0.5px'
            }}
          >
            Your Toolkit for College
          </Typography>
          <Typography
            variant="h6"
            sx={{
              color: 'rgba(255, 255, 255, 0.9)',
              mb: 4,
              textAlign: 'center',
              maxWidth: '800px',
              mx: 'auto',
              px: 2,
              lineHeight: 1.6
            }}
          >
            A modern, vibrant web portal designed for the everyday needs of MIT ADT students, faculty, and visitors. It centralizes all critical campus resources into one seamless platform with a Gen-Z twist.
          </Typography>
          <Button
            variant="contained"
            color="secondary"
            size="large"
            onClick={() => navigate('/login')}
          >
            Get Started
          </Button>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom>
          Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <HomeIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Hostel & Facility Information
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Access hostel details, room availability, and campus facilities information.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <RestaurantIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Mess Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your meal preferences and view mess schedules easily.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
              <FeedbackIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Feedback & Tracking
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Submit feedback and track the status of your complaints.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="md">
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            Ready to Get Started?
          </Typography>
          <Typography variant="body1" align="center" color="text.secondary" paragraph>
            Join thousands of students who are already using KampusKart to manage their college life.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate('/register')}
            >
              Register Now
            </Button>
            <Button
              variant="outlined"
              color="primary"
              size="large"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage; 