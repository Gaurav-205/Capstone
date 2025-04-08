import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Paper,
  Typography,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Rating,
  Divider,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  CircularProgress,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  Drawer,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Checkbox,
  ButtonGroup,
  Collapse,
  TableSortLabel,
} from '@mui/material';
import {
  Restaurant,
  LocalCafe,
  Schedule,
  Star,
  LocationOn,
  Info,
  Close,
  Fastfood,
  Coffee,
  LocalDining,
  DinnerDining,
  FreeBreakfast,
  LunchDining,
  NightsStay,
  Feedback,
  Send,
  ThumbUp,
  ThumbDown,
  Comment,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  AdminPanelSettings,
  Reply as ReplyIcon,
  FilterList as FilterListIcon,
  Sort as SortIcon,
  Archive as ArchiveIcon,
  Unarchive as UnarchiveIcon,
  ArrowBack,
  ArrowForward,
  Assessment,
  KeyboardArrowUp,
  KeyboardArrowDown,
} from '@mui/icons-material';

interface MenuItem {
  name: string;
  description?: string;
  price?: number;
  isVeg: boolean;
  available: boolean;
}

interface MealMenu {
  breakfast: MenuItem[];
  lunch: MenuItem[];
  eveningSnacks: MenuItem[];
  dinner: MenuItem[];
}

interface Mess {
  id: string;
  name: string;
  location: string;
  rating: number;
  capacity: number;
  timings: {
    breakfast: string;
    lunch: string;
    eveningSnacks: string;
    dinner: string;
  };
  menu: MealMenu;
}

interface Canteen {
  id: string;
  name: string;
  location: string;
  rating: number;
  timings: string;
  menu: MenuItem[];
}

interface FeedbackItem {
  id: string;
  userId: string;
  itemName: string;
  rating: number;
  comment: string;
  date: string;
  type: 'mess' | 'canteen';
  facilityId: string;
}

interface FeedbackResponse {
  id: string;
  feedbackId: string;
  response: string;
  respondedBy: string;
  date: string;
}

interface FeedbackStatus {
  id: string;
  status: 'new' | 'in-progress' | 'resolved' | 'archived';
  lastUpdated: string;
}

interface AdminState {
  isAdmin: boolean;
  showAdminControls: boolean;
  userEmail: string | null;
}

interface AdminDashboardProps {
  setShowMessDialog: (show: boolean) => void;
  setShowTimingsDialog: (show: boolean) => void;
  setShowReportsDialog: (show: boolean) => void;
  setShowAdminPanel: (show: boolean) => void;
  getFeedbackStatus: (id: string) => FeedbackStatus['status'];
  handleFeedbackResponse: (id: string) => void;
  diningStats: {
    total: number;
    pending: number;
    resolved: number;
    averageRating: number;
  };
}

// Add a new interface for facility ratings
interface FacilityRating {
  facilityId: string;
  type: 'mess' | 'canteen';
  averageRating: number;
  totalReviews: number;
}

// Sample data for messes
const messes: Mess[] = [
  {
    id: 'mess-1',
    name: 'Main Mess',
    location: 'Central Campus',
    rating: 4.2,
    capacity: 500,
    timings: {
      breakfast: '7:30 AM - 9:30 AM',
      lunch: '12:30 PM - 2:30 PM',
      eveningSnacks: '4:30 PM - 5:30 PM',
      dinner: '7:30 PM - 9:30 PM'
    },
    menu: {
      breakfast: [
        { name: 'Poha', description: 'Flattened rice with peanuts and spices', isVeg: true, available: true },
        { name: 'Idli Sambar', description: 'Steamed rice cakes with lentil soup', isVeg: true, available: true },
        { name: 'Bread & Jam', description: 'Toasted bread with mixed fruit jam', isVeg: true, available: true }
      ],
      lunch: [
        { name: 'Rice & Dal', description: 'Steamed rice with yellow lentils', isVeg: true, available: true },
        { name: 'Roti & Sabzi', description: 'Whole wheat flatbread with mixed vegetables', isVeg: true, available: true },
        { name: 'Salad', description: 'Fresh vegetable salad', isVeg: true, available: true }
      ],
      eveningSnacks: [
        { name: 'Samosa', description: 'Fried pastry with spiced potatoes', isVeg: true, available: true },
        { name: 'Tea/Coffee', description: 'Hot beverages', isVeg: true, available: true }
      ],
      dinner: [
        { name: 'Rice & Dal', description: 'Steamed rice with mixed lentils', isVeg: true, available: true },
        { name: 'Roti & Paneer', description: 'Flatbread with cottage cheese curry', isVeg: true, available: true },
        { name: 'Sweet', description: 'Dessert of the day', isVeg: true, available: true }
      ]
    }
  },
  // Add more messes here
];

// Sample data for canteens
const canteens: Canteen[] = [
  {
    id: 'canteen-1',
    name: 'Tech Café',
    location: 'Engineering Block',
    rating: 4.5,
    timings: '9:00 AM - 9:00 PM',
    menu: [
      { name: 'Veg Burger', description: 'Fresh vegetable patty with lettuce and cheese', price: 60, isVeg: true, available: true },
      { name: 'Masala Dosa', description: 'Crispy rice crepe with potato filling', price: 50, isVeg: true, available: true },
      { name: 'Cold Coffee', description: 'Chilled coffee with ice cream', price: 40, isVeg: true, available: true }
    ]
  },
  // Add more canteens here
];

const sampleFeedback: FeedbackItem[] = [
  {
    id: 'fb-1',
    userId: 'user-1',
    itemName: 'Main Mess',
    rating: 4,
    comment: 'Great food quality and service today!',
    date: '2024-03-21',
    type: 'mess',
    facilityId: 'mess-1'
  },
  {
    id: 'fb-2',
    userId: 'user-2',
    itemName: 'Tech Café',
    rating: 3,
    comment: 'The waiting time was a bit long during lunch hour.',
    date: '2024-03-20',
    type: 'canteen',
    facilityId: 'canteen-1'
  },
];

const sampleFeedbackStatus: FeedbackStatus[] = [
  {
    id: 'fb-1',
    status: 'resolved',
    lastUpdated: '2024-03-21'
  },
  {
    id: 'fb-2',
    status: 'new',
    lastUpdated: '2024-03-20'
  },
];

const sampleFeedbackResponses: FeedbackResponse[] = [
  {
    id: 'resp-1',
    feedbackId: 'fb-1',
    response: 'Thank you for your positive feedback! We strive to maintain this quality.',
    respondedBy: 'Admin',
    date: '2024-03-21'
  },
];

const AdminDashboard: React.FC<AdminDashboardProps> = ({
  setShowMessDialog,
  setShowTimingsDialog,
  setShowReportsDialog,
  setShowAdminPanel,
  getFeedbackStatus,
  handleFeedbackResponse,
  diningStats
}) => {
  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 600 }}>
          Admin Dashboard
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.href = '/mess-management'}
          startIcon={<ArrowBack />}
        >
          Switch to User View
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#3b82f6', color: 'white', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" sx={{ mb: 1 }}>{diningStats.pending}</Typography>
                  <Typography variant="body2">New Feedback</Typography>
                </Box>
                <Feedback sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#ef4444', color: 'white', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" sx={{ mb: 1 }}>{diningStats.pending}</Typography>
                  <Typography variant="body2">Pending Responses</Typography>
                </Box>
                <Comment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#22c55e', color: 'white', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" sx={{ mb: 1 }}>{diningStats.total}</Typography>
                  <Typography variant="body2">Total Feedback</Typography>
                </Box>
                <Assessment sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ bgcolor: '#f59e0b', color: 'white', borderRadius: 2 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h4" sx={{ mb: 1 }}>{diningStats.averageRating}</Typography>
                  <Typography variant="body2">Avg. Rating</Typography>
                </Box>
                <Star sx={{ fontSize: 40, opacity: 0.8 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Quick Actions */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>Quick Actions</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Restaurant />}
              onClick={() => setShowMessDialog(true)}
              sx={{ p: 2, justifyContent: 'flex-start' }}
            >
              Update Menu
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Schedule />}
              onClick={() => setShowTimingsDialog(true)}
              sx={{ p: 2, justifyContent: 'flex-start' }}
            >
              Update Timings
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Button
              fullWidth
              variant="outlined"
              startIcon={<Assessment />}
              onClick={() => setShowReportsDialog(true)}
              sx={{ p: 2, justifyContent: 'flex-start' }}
            >
              Generate Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Recent Feedback Table */}
      <Paper sx={{ p: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Recent Feedback</Typography>
          <Button
            variant="text"
            endIcon={<ArrowForward />}
            onClick={() => setShowAdminPanel(true)}
          >
            View All
          </Button>
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Facility</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {sampleFeedback.slice(0, 5).map((feedback) => {
                const status = getFeedbackStatus(feedback.id);
                return (
                  <TableRow key={feedback.id}>
                    <TableCell>{new Date(feedback.date).toLocaleDateString()}</TableCell>
                    <TableCell>{feedback.itemName}</TableCell>
                    <TableCell>
                      <Rating value={feedback.rating} readOnly size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={status}
                        color={
                          status === 'new' ? 'error' :
                          status === 'in-progress' ? 'warning' :
                          status === 'resolved' ? 'success' :
                          'default'
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleFeedbackResponse(feedback.id)}
                      >
                        <ReplyIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

const MessManagement: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedMess, setSelectedMess] = useState<Mess | null>(null);
  const [selectedCanteen, setSelectedCanteen] = useState<Canteen | null>(null);
  const [mealType, setMealType] = useState<'breakfast' | 'lunch' | 'eveningSnacks' | 'dinner'>('breakfast');
  const [showDetails, setShowDetails] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackItem, setFeedbackItem] = useState<MenuItem | null>(null);
  const [feedbackRating, setFeedbackRating] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [admin, setAdmin] = useState<AdminState>({ 
    isAdmin: false, 
    showAdminControls: false,
    userEmail: null
  });
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);
  const [feedbackPage, setFeedbackPage] = useState(0);
  const [feedbackRowsPerPage, setFeedbackRowsPerPage] = useState(5);
  const [feedbackFilter, setFeedbackFilter] = useState<'all' | 'new' | 'in-progress' | 'resolved' | 'archived'>('all');
  const [feedbackSort, setFeedbackSort] = useState<{ field: string; direction: 'asc' | 'desc' }>({
    field: 'date',
    direction: 'desc'
  });
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [expandedFeedback, setExpandedFeedback] = useState<string | null>(null);
  const [showMessDialog, setShowMessDialog] = useState(false);
  const [showTimingsDialog, setShowTimingsDialog] = useState(false);
  const [showReportsDialog, setShowReportsDialog] = useState(false);
  const [showFullMenu, setShowFullMenu] = useState(false);
  const [selectedMenuType, setSelectedMenuType] = useState<'mess' | 'canteen'>('mess');
  const [selectedMenuFacility, setSelectedMenuFacility] = useState<Mess | Canteen | null>(null);
  const [expandedMenuSection, setExpandedMenuSection] = useState<string | null>(null);
  const [facilityRatings, setFacilityRatings] = useState<Record<string, FacilityRating>>({});
  const [diningStats, setDiningStats] = useState({
    total: 0,
    pending: 5, // Default value shown in the UI
    resolved: 0,
    averageRating: 4.2 // Default value shown in the UI
  });

  useEffect(() => {
    // Get the email from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const currentUserEmail = urlParams.get('email');
    const authorizedEmail = 'gauravkhandelwal205@gmail.com';
    
    setAdmin(prev => ({
      ...prev,
      userEmail: currentUserEmail,
      isAdmin: currentUserEmail === authorizedEmail,
      showAdminControls: currentUserEmail === authorizedEmail
    }));
  }, []);

  const fetchDiningStatistics = useCallback(async () => {
    try {
      // Get dining statistics
      const statsResponse = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/feedback/dining-statistics`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success && statsData.data) {
          setDiningStats({
            total: statsData.data.total || 0,
            pending: statsData.data.pending || 0,
            resolved: statsData.data.resolved || 0,
            averageRating: 0 // Will be updated below
          });
        }
      }

      // Calculate average rating from all facility ratings
      const allRatings = Object.values(facilityRatings);
      if (allRatings.length > 0) {
        const totalRating = allRatings.reduce((sum, facility) => 
          sum + (facility.averageRating || 0), 0);
        const avgRating = totalRating / allRatings.length;
        
        setDiningStats(prev => ({
          ...prev,
          averageRating: parseFloat(avgRating.toFixed(1))
        }));
      }
    } catch (error) {
      console.error('Error fetching dining statistics:', error);
    }
  }, [facilityRatings]);

  useEffect(() => {
    fetchDiningStatistics();
  }, [fetchDiningStatistics]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const getMealIcon = (type: string) => {
    switch (type) {
      case 'breakfast':
        return <FreeBreakfast />;
      case 'lunch':
        return <LunchDining />;
      case 'eveningSnacks':
        return <Coffee />;
      case 'dinner':
        return <DinnerDining />;
      default:
        return <LocalDining />;
    }
  };

  const fetchFacilityRatings = useCallback(async () => {
    try {
      // Fetch ratings for all messes first
      const messRatingPromises = messes.map(async (mess) => {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/feedback/facility-rating?facilityId=${mess.id}&type=mess`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          return { facilityId: mess.id, ...data.data };
        }
        return null;
      });
      
      // Then fetch ratings for all canteens
      const canteenRatingPromises = canteens.map(async (canteen) => {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/feedback/facility-rating?facilityId=${canteen.id}&type=canteen`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          return { facilityId: canteen.id, ...data.data };
        }
        return null;
      });
      
      // Wait for all promises to resolve
      const messRatings = await Promise.all(messRatingPromises);
      const canteenRatings = await Promise.all(canteenRatingPromises);
      
      // Combine all ratings into a single object
      const allRatings = [...messRatings, ...canteenRatings]
        .filter(Boolean)
        .reduce((acc, rating) => {
          if (rating) {
            acc[rating.facilityId] = rating;
          }
          return acc;
        }, {} as Record<string, FacilityRating>);
      
      setFacilityRatings(allRatings);
    } catch (error) {
      console.error('Error fetching facility ratings:', error);
    }
  }, [messes, canteens]);

  useEffect(() => {
    fetchFacilityRatings();
  }, [fetchFacilityRatings]);

  const handleFeedbackSubmit = async () => {
    try {
      // Get facility details
      const facilityId = feedbackItem?.name || '';
      const facilityType = selectedTab === 0 ? 'mess' : 'canteen';
      
      // Find the actual facility to get its name
      const selectedFacility = facilityType === 'mess' 
        ? messes.find(m => m.id === facilityId)
        : canteens.find(c => c.id === facilityId);
      
      if (!selectedFacility) {
        throw new Error('Invalid facility selected');
      }

      // Prepare feedback data
      const feedbackData = {
        facilityId: facilityId,
        facilityName: selectedFacility.name,
        facilityLocation: selectedFacility.location,
        rating: feedbackRating,
        comment: feedbackComment,
        type: facilityType,
        date: new Date().toISOString()
      };

      // Make API call to save feedback
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/feedback/dining`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(feedbackData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit feedback');
      }

      // Show success message
      setSnackbarMessage(`Thank you for your feedback on ${selectedFacility.name}!`);
      setShowSnackbar(true);
      
      // Reset form
      setShowFeedback(false);
      setFeedbackRating(0);
      setFeedbackComment('');
      setFeedbackItem(null);
      
      // Refresh ratings
      fetchFacilityRatings();
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setSnackbarMessage(error instanceof Error ? error.message : 'Failed to submit feedback. Please try again.');
      setShowSnackbar(true);
    }
  };

  const handleAdminPanelOpen = () => {
    setShowAdminPanel(true);
  };

  const handleFeedbackSelect = (feedbackId: string) => {
    setSelectedFeedback(prev => 
      prev.includes(feedbackId)
        ? prev.filter(id => id !== feedbackId)
        : [...prev, feedbackId]
    );
  };

  const handleFeedbackSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedFeedback(sampleFeedback.map(fb => fb.id));
    } else {
      setSelectedFeedback([]);
    }
  };

  const handleFeedbackResponse = (feedbackId: string) => {
    setSelectedFeedback([feedbackId]);
    setShowResponseDialog(true);
  };

  const handleResponseSubmit = () => {
    setShowResponseDialog(false);
    setResponseText('');
    setSnackbarMessage('Response sent successfully!');
    setShowSnackbar(true);
  };

  const handleFeedbackStatusChange = (feedbackIds: string[], status: FeedbackStatus['status']) => {
    setSnackbarMessage(`Feedback status updated to ${status}!`);
    setShowSnackbar(true);
  };

  const getFeedbackStatus = (feedbackId: string): FeedbackStatus['status'] => {
    return sampleFeedbackStatus.find(status => status.id === feedbackId)?.status || 'new';
  };

  const getFeedbackResponse = (feedbackId: string): FeedbackResponse | undefined => {
    return sampleFeedbackResponses.find(response => response.feedbackId === feedbackId);
  };

  const renderMessMenuItems = (items: MenuItem[], mess: Mess, showAll: boolean = false) => {
    const displayItems = showAll ? items : items.slice(0, 3);
    return (
      <Stack spacing={1}>
        {displayItems.map((item, index) => (
          <Box
            key={index}
            sx={{
              p: 1.5,
              bgcolor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ color: '#1e293b' }}>
                {item.name}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Chip
                  size="small"
                  label="Veg"
                  sx={{
                    bgcolor: '#dcfce7',
                    color: '#166534',
                    fontSize: '0.75rem'
                  }}
                />
              </Box>
            </Box>
            {item.description && (
              <Typography variant="body2" sx={{ color: '#64748b' }}>
                {item.description}
              </Typography>
            )}
          </Box>
        ))}
        {!showAll && items.length > 3 && (
          <Button
            variant="text"
            onClick={() => {
              setSelectedMenuType('mess');
              setSelectedMenuFacility(mess);
              setShowFullMenu(true);
            }}
            sx={{ mt: 1 }}
          >
            View {items.length - 3} more items
          </Button>
        )}
      </Stack>
    );
  };

  const renderCanteenMenuItems = (items: MenuItem[], canteen: Canteen, showAll: boolean = false) => {
    const displayItems = showAll ? items : items.slice(0, 3);
    return (
      <Stack spacing={1.5}>
        {displayItems.map((item, index) => (
          <Box
            key={index}
            sx={{
              p: 2,
              bgcolor: '#f8fafc',
              borderRadius: '8px',
              border: '1px solid #e2e8f0'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="subtitle2" sx={{ color: '#1e293b' }}>
                {item.name}
              </Typography>
              <Typography variant="subtitle2" sx={{ color: '#059669' }}>
                ₹{item.price}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
              {item.description}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <Chip
                size="small"
                label={item.available ? 'Available' : 'Sold Out'}
                sx={{
                  bgcolor: item.available ? '#dcfce7' : '#fee2e2',
                  color: item.available ? '#166534' : '#991b1b',
                  fontSize: '0.75rem'
                }}
              />
            </Box>
          </Box>
        ))}
        {!showAll && items.length > 3 && (
          <Button
            variant="text"
            onClick={() => {
              setSelectedMenuType('canteen');
              setSelectedMenuFacility(canteen);
              setShowFullMenu(true);
            }}
            sx={{ mt: 1 }}
          >
            View {items.length - 3} more items
          </Button>
        )}
      </Stack>
    );
  };

  const renderFullMenuDialog = () => (
    <Dialog
      open={showFullMenu}
      onClose={() => setShowFullMenu(false)}
      maxWidth="md"
      fullWidth
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: '16px',
          maxHeight: '90vh'
        }
      }}
    >
      <DialogTitle sx={{ 
        borderBottom: '1px solid #e2e8f0',
        px: 3,
        py: 2
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            {selectedMenuFacility?.name} - Full Menu
          </Typography>
          <IconButton onClick={() => setShowFullMenu(false)}>
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: 3 }}>
        {selectedMenuType === 'mess' && selectedMenuFacility && (
          <Box>
            {Object.entries((selectedMenuFacility as Mess).menu).map(([mealType, items]) => (
              <Box key={mealType} sx={{ mb: 4 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    mb: 2,
                    cursor: 'pointer',
                    '&:hover': { opacity: 0.8 }
                  }}
                  onClick={() => setExpandedMenuSection(expandedMenuSection === mealType ? null : mealType)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getMealIcon(mealType)}
                    <Typography variant="h6">
                      {mealType.replace(/([A-Z])/g, ' $1').trim()}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      {(selectedMenuFacility as Mess).timings[mealType as keyof Mess['timings']]}
                    </Typography>
                    <IconButton size="small">
                      {expandedMenuSection === mealType ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
                    </IconButton>
                  </Box>
                </Box>
                <Collapse in={expandedMenuSection === mealType}>
                  <Grid container spacing={2}>
                    {items.map((item: MenuItem, index: number) => (
                      <Grid item xs={12} sm={6} key={index}>
                        <Box
                          sx={{
                            p: 2,
                            bgcolor: '#f8fafc',
                            borderRadius: '8px',
                            border: '1px solid #e2e8f0',
                            height: '100%'
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="subtitle2" sx={{ color: '#1e293b' }}>
                              {item.name}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Chip
                                size="small"
                                label="Veg"
                                sx={{
                                  bgcolor: '#dcfce7',
                                  color: '#166534',
                                  fontSize: '0.75rem'
                                }}
                              />
                            </Box>
                          </Box>
                          {item.description && (
                            <Typography variant="body2" sx={{ color: '#64748b' }}>
                              {item.description}
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Collapse>
              </Box>
            ))}
          </Box>
        )}
        {selectedMenuType === 'canteen' && selectedMenuFacility && (
          <Grid container spacing={2}>
            {(selectedMenuFacility as Canteen).menu.map((item, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: '#f8fafc',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    height: '100%'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle2" sx={{ color: '#1e293b' }}>
                      {item.name}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: '#059669' }}>
                      ₹{item.price}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ color: '#64748b', mb: 1 }}>
                    {item.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    <Chip
                      size="small"
                      label={item.available ? 'Available' : 'Sold Out'}
                      sx={{
                        bgcolor: item.available ? '#dcfce7' : '#fee2e2',
                        color: item.available ? '#166534' : '#991b1b',
                        fontSize: '0.75rem'
                      }}
                    />
                  </Box>
                </Box>
              </Grid>
            ))}
          </Grid>
        )}
      </DialogContent>
    </Dialog>
  );

  if (admin.userEmail === 'gauravkhandelwal205@gmail.com') {
    return (
      <AdminDashboard
        setShowMessDialog={setShowMessDialog}
        setShowTimingsDialog={setShowTimingsDialog}
        setShowReportsDialog={setShowReportsDialog}
        setShowAdminPanel={setShowAdminPanel}
        getFeedbackStatus={getFeedbackStatus}
        handleFeedbackResponse={handleFeedbackResponse}
        diningStats={diningStats}
      />
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: '#f8fafc', minHeight: '100vh' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ color: '#1e293b', fontWeight: 600 }}>
          Campus Dining
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="outlined"
            startIcon={<Feedback />}
            onClick={() => setShowFeedback(true)}
            sx={{
              textTransform: 'none',
              borderRadius: '8px'
            }}
          >
            Give Feedback
          </Button>
          {admin.userEmail === 'gauravkhandelwal205@gmail.com' && (
            <Tooltip title="Admin Panel">
              <IconButton 
                onClick={handleAdminPanelOpen}
                color={showAdminPanel ? "primary" : "default"}
              >
                <AdminPanelSettings />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>

      <Dialog
        open={showFeedback}
        onClose={() => setShowFeedback(false)}
        maxWidth="sm"
        fullWidth
        sx={{ '& .MuiDialog-paper': { borderRadius: '16px' } }}
      >
        <DialogTitle sx={{ borderBottom: '1px solid #e2e8f0', px: 3, py: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Dining Feedback</Typography>
            <IconButton onClick={() => setShowFeedback(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Stack spacing={3}>
            {/* Facility Type Selector */}
            <Box>
              <Tabs 
                value={selectedTab} 
                onChange={handleTabChange}
                variant="fullWidth"
                sx={{ mb: 2, borderBottom: '1px solid #e2e8f0' }}
              >
                <Tab 
                  icon={<Restaurant sx={{ mr: 1 }} />} 
                  label="Mess" 
                  value={0}
                  sx={{ textTransform: 'none' }}
                />
                <Tab 
                  icon={<LocalCafe sx={{ mr: 1 }} />} 
                  label="Canteen" 
                  value={1}
                  sx={{ textTransform: 'none' }}
                />
              </Tabs>
            </Box>

            {/* Facility Selector */}
            <FormControl fullWidth variant="outlined">
              <InputLabel>{selectedTab === 0 ? 'Select Mess' : 'Select Canteen'}</InputLabel>
              <Select
                value={feedbackItem?.name || ''}
                label={selectedTab === 0 ? 'Select Mess' : 'Select Canteen'}
                onChange={(e) => {
                  const facilityId = e.target.value;
                  const facility = selectedTab === 0 
                    ? messes.find(m => m.id === facilityId)
                    : canteens.find(c => c.id === facilityId);
                  
                  if (facility) {
                    setFeedbackItem({ 
                      name: facilityId,
                      isVeg: true,
                      available: true
                    });
                  }
                }}
                MenuProps={{
                  PaperProps: {
                    style: { maxHeight: 300 }
                  }
                }}
              >
                {selectedTab === 0 ? (
                  messes.map(mess => (
                    <MenuItem key={mess.id} value={mess.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>{mess.name}</Typography>
                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          ({mess.location})
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                ) : (
                  canteens.map(canteen => (
                    <MenuItem key={canteen.id} value={canteen.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography>{canteen.name}</Typography>
                        <Typography variant="caption" sx={{ ml: 1, color: 'text.secondary' }}>
                          ({canteen.location})
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>

            {/* Rating */}
            <Box sx={{ 
              p: 2, 
              bgcolor: '#f8fafc', 
              borderRadius: '8px',
              border: '1px solid #e2e8f0' 
            }}>
              <Typography variant="subtitle2" gutterBottom>
                How would you rate your experience?
              </Typography>
              <Rating
                value={feedbackRating}
                onChange={(event, newValue) => setFeedbackRating(newValue || 0)}
                size="large"
                sx={{ mt: 1 }}
              />
            </Box>

            {/* Comments */}
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              placeholder="Share your feedback about the food quality, service, cleanliness, or any suggestions for improvement..."
              value={feedbackComment}
              onChange={(e) => setFeedbackComment(e.target.value)}
              InputProps={{
                sx: { borderRadius: '8px' }
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0', justifyContent: 'space-between' }}>
          <Button 
            onClick={() => setShowFeedback(false)}
            variant="outlined"
            sx={{ borderRadius: '8px' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            startIcon={<Send />}
            onClick={handleFeedbackSubmit}
            disabled={!feedbackRating || !feedbackItem?.name}
            sx={{ borderRadius: '8px' }}
          >
            Submit Feedback
          </Button>
        </DialogActions>
      </Dialog>

      <Tabs
        value={selectedTab}
        onChange={handleTabChange}
        sx={{
          mb: 3,
          '& .MuiTab-root': {
            textTransform: 'none',
            minHeight: 48,
            fontWeight: 500
          }
        }}
      >
        <Tab icon={<Restaurant sx={{ mr: 1 }} />} label="Mess" />
        <Tab icon={<LocalCafe sx={{ mr: 1 }} />} label="Canteens" />
      </Tabs>

      {selectedTab === 0 && (
        <Grid container spacing={3}>
          {messes.map((mess) => (
            <Grid item xs={12} md={6} key={mess.id}>
              <Card 
                elevation={0}
                sx={{ 
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px',
                  height: '100%'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1, color: '#1e293b' }}>
                        {mess.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOn sx={{ fontSize: 18, color: '#64748b', mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {mess.location}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Star sx={{ fontSize: 18, color: '#f59e0b', mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {facilityRatings[mess.id]?.averageRating > 0 
                              ? facilityRatings[mess.id]?.averageRating 
                              : mess.rating}
                            {facilityRatings[mess.id]?.totalReviews > 0 && 
                              ` (${facilityRatings[mess.id]?.totalReviews} ${facilityRatings[mess.id]?.totalReviews === 1 ? 'review' : 'reviews'})`}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <IconButton 
                      onClick={() => {
                        setSelectedMess(mess);
                        setShowDetails(true);
                      }}
                    >
                      <Info />
                    </IconButton>
                  </Box>

                  <Stack direction="row" spacing={1} sx={{ mb: 3 }}>
                    {Object.keys(mess.menu).map((meal) => (
                      <Button
                        key={meal}
                        variant={mealType === meal ? "contained" : "outlined"}
                        size="small"
                        startIcon={getMealIcon(meal)}
                        onClick={() => setMealType(meal as any)}
                        sx={{
                          textTransform: 'none',
                          borderRadius: '8px',
                          px: 2
                        }}
                      >
                        {meal.replace(/([A-Z])/g, ' $1').trim()}
                      </Button>
                    ))}
                  </Stack>

                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Schedule sx={{ fontSize: 20, color: '#64748b', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {mess.timings[mealType]}
                      </Typography>
                    </Box>

                    <Typography variant="subtitle2" sx={{ mb: 1, color: '#475569' }}>
                      Today's Menu
                    </Typography>
                    
                    {renderMessMenuItems(mess.menu[mealType], mess)}
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedTab === 1 && (
        <Grid container spacing={3}>
          {canteens.map((canteen) => (
            <Grid item xs={12} md={6} key={canteen.id}>
              <Card 
                elevation={0}
                sx={{ 
                  border: '1px solid #e2e8f0',
                  borderRadius: '16px'
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                    <Box>
                      <Typography variant="h6" sx={{ mb: 1, color: '#1e293b' }}>
                        {canteen.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationOn sx={{ fontSize: 18, color: '#64748b', mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {canteen.location}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Star sx={{ fontSize: 18, color: '#f59e0b', mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            {facilityRatings[canteen.id]?.averageRating > 0 
                              ? facilityRatings[canteen.id]?.averageRating 
                              : canteen.rating}
                            {facilityRatings[canteen.id]?.totalReviews > 0 && 
                              ` (${facilityRatings[canteen.id]?.totalReviews} ${facilityRatings[canteen.id]?.totalReviews === 1 ? 'review' : 'reviews'})`}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Schedule sx={{ fontSize: 20, color: '#64748b', mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {canteen.timings}
                      </Typography>
                    </Box>
                  </Box>

                  <Typography variant="subtitle2" sx={{ mb: 2, color: '#475569' }}>
                    Menu Items
                  </Typography>

                  {renderCanteenMenuItems(canteen.menu, canteen)}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            borderRadius: '16px',
            overflow: 'hidden'
          }
        }}
      >
        {selectedMess && (
          <>
            <DialogTitle sx={{ 
              borderBottom: '1px solid #e2e8f0',
              px: 3,
              py: 2
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedMess.name} Details</Typography>
                <IconButton onClick={() => setShowDetails(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Timings
                  </Typography>
                  <Stack spacing={2}>
                    {Object.entries(selectedMess.timings).map(([meal, time]) => (
                      <Box key={meal} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getMealIcon(meal)}
                        <Box>
                          <Typography variant="subtitle2" sx={{ color: '#1e293b' }}>
                            {meal.replace(/([A-Z])/g, ' $1').trim()}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#64748b' }}>
                            {time}
                          </Typography>
                        </Box>
                      </Box>
                    ))}
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Facilities
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Chip label={`Capacity: ${selectedMess.capacity} seats`} />
                      <Chip label={`Rating: ${facilityRatings[selectedMess.id]?.averageRating > 0 
                        ? facilityRatings[selectedMess.id]?.averageRating 
                        : selectedMess.rating}/5 ${facilityRatings[selectedMess.id]?.totalReviews > 0 
                          ? `(${facilityRatings[selectedMess.id]?.totalReviews} ${facilityRatings[selectedMess.id]?.totalReviews === 1 ? 'review' : 'reviews'})` 
                          : ''}`} />
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2, borderTop: '1px solid #e2e8f0' }}>
              <Button onClick={() => setShowDetails(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {admin.userEmail === 'gauravkhandelwal205@gmail.com' && (
        <Drawer
          anchor="right"
          open={showAdminPanel}
          onClose={() => setShowAdminPanel(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: '80%',
              maxWidth: 1000,
              p: 3,
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Feedback Management</Typography>
            <IconButton onClick={() => setShowAdminPanel(false)}>
              <Close />
            </IconButton>
          </Box>

          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ButtonGroup size="small">
              <Button
                variant={feedbackFilter === 'all' ? 'contained' : 'outlined'}
                onClick={() => setFeedbackFilter('all')}
              >
                All
              </Button>
              <Button
                variant={feedbackFilter === 'new' ? 'contained' : 'outlined'}
                onClick={() => setFeedbackFilter('new')}
              >
                New
              </Button>
              <Button
                variant={feedbackFilter === 'in-progress' ? 'contained' : 'outlined'}
                onClick={() => setFeedbackFilter('in-progress')}
              >
                In Progress
              </Button>
              <Button
                variant={feedbackFilter === 'resolved' ? 'contained' : 'outlined'}
                onClick={() => setFeedbackFilter('resolved')}
              >
                Resolved
              </Button>
              <Button
                variant={feedbackFilter === 'archived' ? 'contained' : 'outlined'}
                onClick={() => setFeedbackFilter('archived')}
              >
                Archived
              </Button>
            </ButtonGroup>

            <Box>
              {selectedFeedback.length > 0 && (
                <ButtonGroup size="small" sx={{ mr: 2 }}>
                  <Button
                    startIcon={<ReplyIcon />}
                    onClick={() => setShowResponseDialog(true)}
                  >
                    Respond
                  </Button>
                  <Button
                    startIcon={<ArchiveIcon />}
                    onClick={() => handleFeedbackStatusChange(selectedFeedback, 'archived')}
                  >
                    Archive
                  </Button>
                </ButtonGroup>
              )}
            </Box>
          </Box>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedFeedback.length > 0 && selectedFeedback.length < sampleFeedback.length}
                      checked={selectedFeedback.length === sampleFeedback.length}
                      onChange={handleFeedbackSelectAll}
                    />
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={feedbackSort.field === 'date'}
                      direction={feedbackSort.direction}
                      onClick={() => setFeedbackSort(prev => ({
                        field: 'date',
                        direction: prev.direction === 'asc' ? 'desc' : 'asc'
                      }))}
                    >
                      Date
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>Facility</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sampleFeedback
                  .slice(feedbackPage * feedbackRowsPerPage, (feedbackPage + 1) * feedbackRowsPerPage)
                  .map((feedback) => {
                    const isSelected = selectedFeedback.includes(feedback.id);
                    const isExpanded = expandedFeedback === feedback.id;
                    const status = getFeedbackStatus(feedback.id);
                    const response = getFeedbackResponse(feedback.id);

                    return (
                      <React.Fragment key={feedback.id}>
                        <TableRow
                          selected={isSelected}
                          hover
                        >
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={isSelected}
                              onChange={() => handleFeedbackSelect(feedback.id)}
                            />
                          </TableCell>
                          <TableCell>{new Date(feedback.date).toLocaleDateString()}</TableCell>
                          <TableCell>{feedback.itemName}</TableCell>
                          <TableCell>
                            <Rating value={feedback.rating} readOnly size="small" />
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={status}
                              color={
                                status === 'new' ? 'error' :
                                status === 'in-progress' ? 'warning' :
                                status === 'resolved' ? 'success' :
                                'default'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() => setExpandedFeedback(isExpanded ? null : feedback.id)}
                            >
                              {isExpanded ? <Close fontSize="small" /> : <Info fontSize="small" />}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleFeedbackResponse(feedback.id)}
                            >
                              <ReplyIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={6} sx={{ py: 0 }}>
                            <Collapse in={isExpanded}>
                              <Box sx={{ p: 2 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Feedback:
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                  {feedback.comment}
                                </Typography>
                                {response && (
                                  <>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Response:
                                    </Typography>
                                    <Typography variant="body2">
                                      {response.response}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      Responded by {response.respondedBy} on {new Date(response.date).toLocaleDateString()}
                                    </Typography>
                                  </>
                                )}
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={sampleFeedback.length}
            page={feedbackPage}
            onPageChange={(e, newPage) => setFeedbackPage(newPage)}
            rowsPerPage={feedbackRowsPerPage}
            onRowsPerPageChange={(e) => {
              setFeedbackRowsPerPage(parseInt(e.target.value, 10));
              setFeedbackPage(0);
            }}
          />
        </Drawer>
      )}

      <Dialog
        open={showResponseDialog}
        onClose={() => setShowResponseDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Respond to Feedback</Typography>
            <IconButton onClick={() => setShowResponseDialog(false)}>
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={responseText}
            onChange={(e) => setResponseText(e.target.value)}
            placeholder="Type your response here..."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowResponseDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleResponseSubmit}
            disabled={!responseText.trim()}
          >
            Send Response
          </Button>
        </DialogActions>
      </Dialog>

      {renderFullMenuDialog()}

      <Snackbar
        open={showSnackbar}
        autoHideDuration={4000}
        onClose={() => setShowSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowSnackbar(false)} 
          severity="success"
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default MessManagement; 