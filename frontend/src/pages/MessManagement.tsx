import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Restaurant as RestaurantIcon } from '@mui/icons-material';

interface MessSchedule {
  id: string;
  name: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  price: number;
}

const MessManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [schedules, setSchedules] = useState<MessSchedule[]>([]);

  useEffect(() => {
    fetchMessSchedules();
  }, []);

  const fetchMessSchedules = async () => {
    try {
      // TODO: Replace with actual API call
      const mockData: MessSchedule[] = [
        {
          id: '1',
          name: 'Main Mess',
          breakfast: '7:00 AM - 9:00 AM',
          lunch: '12:00 PM - 2:00 PM',
          dinner: '7:00 PM - 9:00 PM',
          price: 100,
        },
        {
          id: '2',
          name: 'North Campus Mess',
          breakfast: '7:30 AM - 9:30 AM',
          lunch: '12:30 PM - 2:30 PM',
          dinner: '7:30 PM - 9:30 PM',
          price: 90,
        },
      ];
      setSchedules(mockData);
    } catch (error) {
      setError('Failed to fetch mess schedules');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Mess Management
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          View and manage your mess preferences
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {schedules.map((schedule) => (
          <Grid item xs={12} md={6} key={schedule.id}>
            <Paper elevation={3} sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <RestaurantIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
                <Typography variant="h5" component="h2">
                  {schedule.name}
                </Typography>
              </Box>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle1" color="text.secondary">
                  Breakfast: {schedule.breakfast}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Lunch: {schedule.lunch}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Dinner: {schedule.dinner}
                </Typography>
                <Typography variant="subtitle1" color="text.secondary">
                  Price: ₹{schedule.price} per meal
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                fullWidth
                onClick={() => {
                  // TODO: Implement mess selection
                }}
              >
                Select Mess
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default MessManagement; 