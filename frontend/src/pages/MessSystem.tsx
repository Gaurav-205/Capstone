import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Rating,
  CircularProgress,
  Alert,
  IconButton,
  AppBar,
  Toolbar,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Restaurant as RestaurantIcon,
  ArrowBack as ArrowBackIcon,
  AccessTime as AccessTimeIcon,
  Star as StarIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';

interface Mess {
  _id: string;
  name: string;
  type: string;
  operatingHours: {
    open: string;
    close: string;
    lunch: {
      start: string;
      end: string;
    };
    dinner: {
      start: string;
      end: string;
    };
  };
  averageRating: number;
  isOpen: boolean;
  location: string;
  capacity: number;
  currentOccupancy: number;
  subscriptionPlans: Array<{
    mealType: 'Lunch' | 'Dinner';
    price: number;
    duration: string;
  }>;
}

const MessSystem: React.FC = () => {
  const navigate = useNavigate();
  const [messes, setMesses] = useState<Mess[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredMesses, setFilteredMesses] = useState<Mess[]>([]);

  useEffect(() => {
    const fetchMesses = async () => {
      try {
        const response = await axios.get(`${API_URL}/mess`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.data) {
          throw new Error('Failed to fetch mess data');
        }

        setMesses(response.data);
        setFilteredMesses(response.data);
      } catch (error: any) {
        console.error('Error fetching mess data:', error);
        setError(error.response?.data?.message || 'Failed to load mess data');
      } finally {
        setLoading(false);
      }
    };

    fetchMesses();
  }, []);

  useEffect(() => {
    const filtered = messes.filter(mess => 
      mess.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mess.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      mess.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMesses(filtered);
  }, [searchQuery, messes]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mess & Canteen System
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search mess halls by name, type, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>

        <Grid container spacing={3}>
          {filteredMesses.map((mess) => (
            <Grid item xs={12} md={6} lg={4} key={mess._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <RestaurantIcon sx={{ mr: 1 }} />
                    <Typography variant="h6" component="div">
                      {mess.name}
                    </Typography>
                  </Box>

                  <Typography color="text.secondary" gutterBottom>
                    {mess.type.charAt(0).toUpperCase() + mess.type.slice(1)}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <AccessTimeIcon sx={{ mr: 1, fontSize: 'small' }} />
                    <Typography variant="body2">
                      {mess.operatingHours.open} - {mess.operatingHours.close}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <StarIcon sx={{ mr: 1, fontSize: 'small' }} />
                    <Rating value={mess.averageRating} readOnly precision={0.5} />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({mess.averageRating.toFixed(1)})
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Location: {mess.location}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Capacity: {mess.currentOccupancy}/{mess.capacity}
                  </Typography>

                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Subscription Plans:
                    </Typography>
                    {mess.subscriptionPlans.map((plan, index) => (
                      <Typography key={index} variant="body2" color="text.secondary">
                        {plan.mealType}: ₹{plan.price} ({plan.duration})
                      </Typography>
                    ))}
                  </Box>

                  <Box sx={{ mt: 2 }}>
                    <Chip
                      label={mess.isOpen ? 'Open' : 'Closed'}
                      color={mess.isOpen ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    onClick={() => navigate(`/mess/${mess._id}`)}
                    fullWidth
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </>
  );
};

export default MessSystem; 