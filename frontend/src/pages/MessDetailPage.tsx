import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Rating,
  TextField,
  CircularProgress,
  Alert,
  IconButton,
  AppBar,
  Toolbar,
  Divider,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tab,
  Tabs,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Snackbar,
  List
} from '@mui/material';
import {
  ArrowBack,
  AccessTime,
  Star,
  LocationOn,
  Restaurant,
  People,
  LocalDining
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config';
import WeeklyMenuView from '../components/mess/WeeklyMenuView';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`mess-tabpanel-${index}`}
      aria-labelledby={`mess-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

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
    _id: string;
    mealType: 'Lunch' | 'Dinner';
    price: number;
    duration: string;
  }>;
  ratings: Array<{
    userId: string;
    rating: number;
    review: string;
    createdAt: string;
  }>;
  menu: Array<{
    category: string;
    items: Array<{
      name: string;
      price: number;
      description?: string;
    }>;
  }>;
}

const MessDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [mess, setMess] = useState<Mess | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [newRating, setNewRating] = useState<number | null>(0);
  const [newReview, setNewReview] = useState('');
  const [selectedMealType, setSelectedMealType] = useState<'Lunch' | 'Dinner'>('Lunch');
  const [currentTab, setCurrentTab] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchMessDetails = async () => {
      try {
        const response = await axios.get(`${API_URL}/mess/${id}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.data) {
          throw new Error('Failed to fetch mess details');
        }

        setMess(response.data);
      } catch (error: any) {
        console.error('Error fetching mess details:', error);
        setError(error.response?.data?.message || 'Failed to load mess details');
      } finally {
        setLoading(false);
      }
    };

    fetchMessDetails();
  }, [id]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  const handleRatingSubmit = async () => {
    if (!mess || !newRating || !newReview) return;

    try {
      setIsSubmitting(true);
      await axios.post(
        `${API_URL}/mess/${mess._id}/ratings`,
        {
          rating: newRating,
          review: newReview
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Refresh mess details
      const response = await axios.get(`${API_URL}/mess/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMess(response.data);
      setShowRatingDialog(false);
      setNewRating(0);
      setNewReview('');
    } catch (error: any) {
      console.error('Error submitting rating:', error);
      setError(error.response?.data?.message || 'Failed to submit rating');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubscribe = async () => {
    if (!mess) return;

    try {
      setIsSubmitting(true);
      const subscriptionPlan = mess.subscriptionPlans.find(
        plan => plan.mealType === selectedMealType
      );

      if (!subscriptionPlan) {
        throw new Error('Selected meal type not available');
      }

      await axios.post(
        `${API_URL}/mess/${mess._id}/subscribe`,
        {
          mealType: selectedMealType,
          planId: subscriptionPlan._id
        },
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      // Refresh mess details
      const response = await axios.get(`${API_URL}/mess/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      setMess(response.data);
    } catch (error: any) {
      console.error('Error subscribing to mess:', error);
      setError(error.response?.data?.message || 'Failed to subscribe to mess');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!mess) {
    return (
      <Container>
        <Alert severity="error">Mess not found</Alert>
      </Container>
    );
  }

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => navigate('/mess')}
            sx={{ mr: 2 }}
          >
            <ArrowBack />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {mess.name}
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Restaurant sx={{ mr: 1 }} />
                  <Typography variant="h5" component="div">
                    {mess.name}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationOn sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant="body2">
                    {mess.location}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AccessTime sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant="body2">
                    Operating Hours: {mess.operatingHours.open} - {mess.operatingHours.close}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <People sx={{ mr: 1, fontSize: 'small' }} />
                  <Typography variant="body2">
                    Capacity: {mess.currentOccupancy}/{mess.capacity}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Star sx={{ mr: 1, fontSize: 'small' }} />
                  <Rating value={mess.averageRating} readOnly precision={0.5} />
                  <Typography variant="body2" sx={{ ml: 1 }}>
                    ({mess.averageRating.toFixed(1)})
                  </Typography>
                </Box>

                <Chip
                  label={mess.isOpen ? 'Open' : 'Closed'}
                  color={mess.isOpen ? 'success' : 'error'}
                  size="small"
                />
              </CardContent>
            </Card>

            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={currentTab} onChange={handleTabChange}>
                <Tab label="Menu" />
                <Tab label="Reviews" />
                <Tab label="Subscription" />
              </Tabs>
            </Box>

            <TabPanel value={currentTab} index={0}>
              <WeeklyMenuView />
            </TabPanel>

            <TabPanel value={currentTab} index={1}>
              <Box sx={{ mb: 2 }}>
                <Button
                  variant="contained"
                  onClick={() => setShowRatingDialog(true)}
                >
                  Add Review
                </Button>
              </Box>

              <List>
                {mess.ratings.map((rating, index) => (
                  <Paper key={index} sx={{ mb: 2, p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating value={rating.rating} readOnly size="small" />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        {new Date(rating.createdAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography variant="body1">
                      {rating.review}
                    </Typography>
                  </Paper>
                ))}
              </List>
            </TabPanel>

            <TabPanel value={currentTab} index={2}>
              <Box sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Subscribe to Mess
                  </Typography>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Meal Rates & Timings
                    </Typography>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" display="flex" alignItems="center">
                        <LocalDining sx={{ mr: 1, fontSize: 'small' }} />
                        Lunch (₹100) - {mess.operatingHours.lunch.start} to {mess.operatingHours.lunch.end}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" display="flex" alignItems="center">
                        <LocalDining sx={{ mr: 1, fontSize: 'small' }} />
                        Dinner (₹100) - {mess.operatingHours.dinner.start} to {mess.operatingHours.dinner.end}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider sx={{ mb: 3 }} />
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Select Meal</InputLabel>
                    <Select
                      value={selectedMealType}
                      onChange={(e) => setSelectedMealType(e.target.value as 'Lunch' | 'Dinner')}
                      label="Select Meal"
                    >
                      <MenuItem value="Lunch">Lunch</MenuItem>
                      <MenuItem value="Dinner">Dinner</MenuItem>
                    </Select>
                  </FormControl>
                  <Button
                    variant="contained"
                    onClick={handleSubscribe}
                    disabled={isSubmitting}
                    fullWidth
                    startIcon={<LocalDining />}
                  >
                    {isSubmitting ? <CircularProgress size={24} /> : 'Subscribe'}
                  </Button>
                </Paper>
              </Box>
            </TabPanel>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Operating Hours
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2">Lunch</Typography>
                  <Typography variant="body2">
                    {mess.operatingHours.lunch.start} - {mess.operatingHours.lunch.end}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2">Dinner</Typography>
                  <Typography variant="body2">
                    {mess.operatingHours.dinner.start} - {mess.operatingHours.dinner.end}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      <Dialog open={showRatingDialog} onClose={() => setShowRatingDialog(false)}>
        <DialogTitle>Add Review</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Rating
              value={newRating}
              onChange={(_, value) => setNewRating(value)}
              size="large"
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Review"
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRatingDialog(false)}>Cancel</Button>
          <Button
            onClick={handleRatingSubmit}
            variant="contained"
            disabled={!newRating || !newReview || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        message={error}
      />
    </>
  );
};

export default MessDetailPage; 