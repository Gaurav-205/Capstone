import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Card,
  CardContent,
  CardActions,
  Divider,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  useTheme,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios, { AxiosError } from 'axios';
import { API_URL } from '../../config';
import { getAuthHeaders } from '../../utils/auth';
import { useAuth } from '../../contexts/AuthContext';

interface Hostel {
  _id: string;
  name: string;
  type: 'Boys' | 'Girls' | 'PG';
  totalRooms: number;
  occupiedRooms: number;
  location: {
    building: string;
    floor: string;
    type: string;
    coordinates: [number, number]; // [longitude, latitude]
  };
  contactInfo: {
    warden: {
      name: string;
      phone: string;
      email: string;
    };
    admin: {
      name: string;
      phone: string;
      email: string;
    };
  };
  facilities: Array<{
    name: string;
    description: string;
    isAvailable: boolean;
  }>;
  rules: string[];
  images: string[];
  ratings: {
    cleanliness: number;
    food: number;
    security: number;
    maintenance: number;
    overall: number;
  };
  fees: {
    monthly: number;
    security: number;
    mess: number;
  };
  amenities: {
    wifi: boolean;
    laundry: boolean;
    mess: boolean;
    sports: boolean;
    security: boolean;
    cleaning: boolean;
    transport: boolean;
    parking: boolean;
    medical: boolean;
    library: boolean;
    computer: boolean;
  };
}

interface ErrorResponse {
  message: string;
  error?: string;
  details?: any;
}

interface FormData {
  name: string;
  type: 'Boys' | 'Girls' | 'PG';
  totalRooms: number;
  occupiedRooms: number;
  location: {
    building: string;
    floor: string;
    type: string;
    coordinates: [number, number];
  };
  contactInfo: {
    warden: {
      name: string;
      phone: string;
      email: string;
    };
    admin: {
      name: string;
      phone: string;
      email: string;
    };
  };
  facilities: Array<{ name: string; description: string; isAvailable: boolean }>;
  rules: string[];
  images: string[];
  ratings: {
    cleanliness: number;
    food: number;
    security: number;
    maintenance: number;
    overall: number;
  };
  fees: {
    monthly: number;
    security: number;
    mess: number;
  };
  amenities: {
    wifi: boolean;
    laundry: boolean;
    mess: boolean;
    sports: boolean;
    security: boolean;
    cleaning: boolean;
    transport: boolean;
    parking: boolean;
    medical: boolean;
    library: boolean;
    computer: boolean;
  };
  timings: {
    inTime: string;
    outTime: string;
    visitingHours: string;
  };
  messDetails: {
    type: string;
    timings: {
      breakfast: string;
      lunch: string;
      dinner: string;
    };
    menu: {
      [key: string]: string[];
    };
  };
}

// Add axios interceptor for logging
axios.interceptors.request.use(request => {
  console.log('Starting Request:', request);
  return request;
});

axios.interceptors.response.use(
  response => {
    console.log('Response:', response);
    return response;
  },
  error => {
    console.log('Error Response:', error.response);
    return Promise.reject(error);
  }
);

const HostelManagement: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formData, setFormData] = useState<FormData>({
    name: '',
    type: 'Boys',
    totalRooms: 1,
    occupiedRooms: 0,
    location: {
      building: '',
      floor: '',
      type: 'Point',
      coordinates: [0, 0]
    },
    contactInfo: {
      warden: {
        name: '',
        phone: '',
        email: ''
      },
      admin: {
        name: '',
        phone: '',
        email: ''
      }
    },
    facilities: [],
    rules: [],
    images: [],
    ratings: {
      cleanliness: 0,
      food: 0,
      security: 0,
      maintenance: 0,
      overall: 0
    },
    fees: {
      monthly: 0,
      security: 0,
      mess: 0
    },
    amenities: {
      wifi: false,
      laundry: false,
      mess: false,
      sports: false,
      security: false,
      cleaning: false,
      transport: false,
      parking: false,
      medical: false,
      library: false,
      computer: false
    },
    timings: {
      inTime: '10:00 PM',
      outTime: '6:00 AM',
      visitingHours: '4:00 PM - 6:00 PM'
    },
    messDetails: {
      type: 'Vegetarian',
      timings: {
        breakfast: '7:30 AM - 9:30 AM',
        lunch: '12:30 PM - 2:30 PM',
        dinner: '7:30 PM - 9:30 PM'
      },
      menu: {
        monday: [],
        tuesday: [],
        wednesday: [],
        thursday: [],
        friday: [],
        saturday: [],
        sunday: []
      }
    }
  });

  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetchHostels();
    }
  }, [isAuthenticated, isAdmin]);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/hostels`, {
        headers: getAuthHeaders()
      });
      setHostels(response.data);
      setError(null);
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      const errorMessage = error.response?.data?.message || 'Failed to fetch hostels';
      setError(errorMessage);
      console.error('Error fetching hostels:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (hostel?: Hostel) => {
    if (hostel) {
      setSelectedHostel(hostel);
      setFormData({
        name: hostel.name,
        type: hostel.type,
        totalRooms: hostel.totalRooms,
        occupiedRooms: hostel.occupiedRooms,
        location: {
          building: hostel.location.building,
          floor: hostel.location.floor,
          type: 'Point',
          coordinates: hostel.location.coordinates
        },
        contactInfo: hostel.contactInfo,
        facilities: hostel.facilities,
        rules: hostel.rules,
        images: hostel.images,
        ratings: hostel.ratings,
        fees: hostel.fees,
        amenities: hostel.amenities,
        timings: {
          inTime: '',
          outTime: '',
          visitingHours: ''
        },
        messDetails: {
          type: 'Vegetarian',
          timings: {
            breakfast: '7:30 AM - 9:30 AM',
            lunch: '12:30 PM - 2:30 PM',
            dinner: '7:30 PM - 9:30 PM'
          },
          menu: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
          }
        }
      });
    } else {
      setSelectedHostel(null);
      setFormData({
        name: '',
        type: 'Boys',
        totalRooms: 1,
        occupiedRooms: 0,
        location: {
          building: '',
          floor: '',
          type: 'Point',
          coordinates: [0, 0]
        },
        contactInfo: {
          warden: { name: '', phone: '', email: '' },
          admin: { name: '', phone: '', email: '' }
        },
        facilities: [],
        rules: [],
        images: [],
        ratings: {
          cleanliness: 0,
          food: 0,
          security: 0,
          maintenance: 0,
          overall: 0
        },
        fees: {
          monthly: 0,
          security: 0,
          mess: 0
        },
        amenities: {
          wifi: false,
          laundry: false,
          mess: false,
          sports: false,
          security: false,
          cleaning: false,
          transport: false,
          parking: false,
          medical: false,
          library: false,
          computer: false
        },
        timings: {
          inTime: '',
          outTime: '',
          visitingHours: ''
        },
        messDetails: {
          type: 'Vegetarian',
          timings: {
            breakfast: '7:30 AM - 9:30 AM',
            lunch: '12:30 PM - 2:30 PM',
            dinner: '7:30 PM - 9:30 PM'
          },
          menu: {
            monday: [],
            tuesday: [],
            wednesday: [],
            thursday: [],
            friday: [],
            saturday: [],
            sunday: []
          }
        }
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedHostel(null);
  };

  const handleNumberChange = (value: string, setter: (value: number) => void) => {
    const parsed = parseFloat(value);
    setter(isNaN(parsed) ? 0 : parsed);
  };

  const handleSubmit = async () => {
    try {
      if (!isAuthenticated) {
        setSnackbar({
          open: true,
          message: 'You must be logged in to perform this action',
          severity: 'error'
        });
        return;
      }

      if (!isAdmin) {
        setSnackbar({
          open: true,
          message: 'You do not have permission to perform this action. Admin privileges required.',
          severity: 'error'
        });
        return;
      }

      // Validate all required fields
      const requiredFields = [
        { field: 'name', value: formData.name.trim(), message: 'Hostel name is required' },
        { field: 'totalRooms', value: formData.totalRooms >= 1, message: 'Total rooms must be at least 1' },
        { field: 'location.building', value: formData.location.building.trim(), message: 'Building name is required' },
        { field: 'location.floor', value: formData.location.floor.trim(), message: 'Floor number/name is required' },
        { field: 'contactInfo.warden.name', value: formData.contactInfo.warden.name.trim(), message: 'Warden name is required' },
        { field: 'contactInfo.warden.phone', value: formData.contactInfo.warden.phone.trim(), message: 'Warden phone is required' },
        { field: 'contactInfo.warden.email', value: formData.contactInfo.warden.email.trim(), message: 'Warden email is required' },
        { field: 'contactInfo.admin.name', value: formData.contactInfo.admin.name.trim(), message: 'Admin name is required' },
        { field: 'contactInfo.admin.phone', value: formData.contactInfo.admin.phone.trim(), message: 'Admin phone is required' },
        { field: 'contactInfo.admin.email', value: formData.contactInfo.admin.email.trim(), message: 'Admin email is required' },
        { field: 'timings.inTime', value: formData.timings.inTime.trim(), message: 'In time is required' },
        { field: 'timings.outTime', value: formData.timings.outTime.trim(), message: 'Out time is required' },
        { field: 'timings.visitingHours', value: formData.timings.visitingHours.trim(), message: 'Visiting hours are required' },
        { field: 'messDetails.type', value: formData.messDetails.type.trim(), message: 'Mess type is required' },
        { field: 'messDetails.timings.breakfast', value: formData.messDetails.timings.breakfast.trim(), message: 'Breakfast timing is required' },
        { field: 'messDetails.timings.lunch', value: formData.messDetails.timings.lunch.trim(), message: 'Lunch timing is required' },
        { field: 'messDetails.timings.dinner', value: formData.messDetails.timings.dinner.trim(), message: 'Dinner timing is required' }
      ];

      // Check for empty required fields
      const missingField = requiredFields.find(field => !field.value);
      if (missingField) {
        setSnackbar({
          open: true,
          message: missingField.message,
          severity: 'error'
        });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emails = [
        { value: formData.contactInfo.warden.email, field: 'Warden email' },
        { value: formData.contactInfo.admin.email, field: 'Admin email' }
      ];
      const invalidEmail = emails.find(email => !emailRegex.test(email.value));
      if (invalidEmail) {
        setSnackbar({
          open: true,
          message: `${invalidEmail.field} format is invalid`,
          severity: 'error'
        });
        return;
      }

      // Validate phone number format (at least 10 digits)
      const phoneRegex = /^\+?[1-9]\d{9,14}$/;
      const phones = [
        { value: formData.contactInfo.warden.phone, field: 'Warden phone' },
        { value: formData.contactInfo.admin.phone, field: 'Admin phone' }
      ];
      const invalidPhone = phones.find(phone => !phoneRegex.test(phone.value));
      if (invalidPhone) {
        setSnackbar({
          open: true,
          message: `${invalidPhone.field} format is invalid (should be 10-15 digits)`,
          severity: 'error'
        });
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setSnackbar({
          open: true,
          message: 'Authentication token not found. Please log in again.',
          severity: 'error'
        });
        return;
      }

      const headers = getAuthHeaders();
      console.log('Auth headers:', headers);
      console.log('Submitting hostel data:', JSON.stringify(formData, null, 2));
      
      const config = {
        headers,
        validateStatus: function (status: number): boolean {
          return status < 500;
        }
      };

      if (selectedHostel) {
        const response = await axios.put(`${API_URL}/hostels/${selectedHostel._id}`, formData, config);
        console.log('Update response:', response);
        if (response.status === 403) {
          setSnackbar({
            open: true,
            message: 'You do not have permission to update hostels. Admin privileges required.',
            severity: 'error'
          });
          return;
        }
        if (response.status === 401) {
          setSnackbar({
            open: true,
            message: 'Your session has expired. Please log in again.',
            severity: 'error'
          });
          return;
        }
        setSnackbar({ open: true, message: 'Hostel updated successfully', severity: 'success' });
      } else {
        const response = await axios.post(`${API_URL}/hostels`, formData, config);
        console.log('Create response:', response);
        if (response.status === 403) {
          setSnackbar({
            open: true,
            message: 'You do not have permission to create hostels. Admin privileges required.',
            severity: 'error'
          });
          return;
        }
        if (response.status === 401) {
          setSnackbar({
            open: true,
            message: 'Your session has expired. Please log in again.',
            severity: 'error'
          });
          return;
        }
        setSnackbar({ open: true, message: 'Hostel created successfully', severity: 'success' });
      }
      fetchHostels();
      handleCloseDialog();
    } catch (err) {
      const error = err as AxiosError<ErrorResponse>;
      console.error('Full error object:', error);
      console.error('Error response:', error.response);
      console.error('Error request:', error.request);
      console.error('Error config:', error.config);
      
      let errorMessage = 'Operation failed';
      if (error.response) {
        if (error.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action. Admin privileges required.';
        } else if (error.response.status === 401) {
          errorMessage = 'Your session has expired. Please log in again.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data?.message || 'Invalid input data';
        } else {
          errorMessage = error.response.data?.message || `Server error: ${error.response.status}`;
        }
      } else if (error.request) {
        errorMessage = 'No response received from server. Please check your internet connection.';
      } else {
        errorMessage = error.message || 'An error occurred';
      }
      
      setSnackbar({ 
        open: true, 
        message: errorMessage,
        severity: 'error' 
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdmin) {
      setSnackbar({
        open: true,
        message: 'You do not have permission to delete hostels. Admin privileges required.',
        severity: 'error'
      });
      return;
    }

    if (window.confirm('Are you sure you want to delete this hostel?')) {
      try {
        const response = await axios.delete(`${API_URL}/hostels/${id}`, {
          headers: getAuthHeaders(),
          validateStatus: function (status: number): boolean {
            return status < 500;
          }
        });

        if (response.status === 403) {
          setSnackbar({
            open: true,
            message: 'You do not have permission to delete hostels. Admin privileges required.',
            severity: 'error'
          });
          return;
        }

        setSnackbar({ open: true, message: 'Hostel deleted successfully', severity: 'success' });
        fetchHostels();
      } catch (err) {
        const error = err as AxiosError<ErrorResponse>;
        let errorMessage = 'Failed to delete hostel';
        if (error.response?.status === 403) {
          errorMessage = 'You do not have permission to delete hostels. Admin privileges required.';
        }
        setSnackbar({ open: true, message: errorMessage, severity: 'error' });
        console.error('Error deleting hostel:', err);
      }
    }
  };

  const getAvailabilityColor = (occupied: number, total: number) => {
    const percentage = (occupied / total) * 100;
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAdmin) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">
          You do not have permission to access this page. Admin privileges required.
        </Alert>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 600 }}>
          Hostel Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ borderRadius: 2 }}
        >
          Add New Hostel
        </Button>
      </Box>

      <Grid container spacing={3}>
        {hostels.map((hostel) => (
          <Grid item xs={12} sm={6} md={4} key={hostel._id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="div">
                    {hostel.name}
                  </Typography>
                  <Chip
                    label={hostel.type}
                    color={hostel.type === 'Boys' ? 'primary' : hostel.type === 'Girls' ? 'secondary' : 'default'}
                    size="small"
                  />
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Building: {hostel.location.building}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Floor: {hostel.location.floor}
                  </Typography>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Warden: {hostel.contactInfo.warden.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Contact: {hostel.contactInfo.warden.phone}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="body2">
                    Rooms: {hostel.occupiedRooms}/{hostel.totalRooms}
                  </Typography>
                  <Chip
                    label={`${Math.round((hostel.occupiedRooms / hostel.totalRooms) * 100)}% Occupied`}
                    color={getAvailabilityColor(hostel.occupiedRooms, hostel.totalRooms)}
                    size="small"
                  />
                </Box>
              </CardContent>

              <CardActions sx={{ mt: 'auto', justifyContent: 'flex-end' }}>
                <Tooltip title="Edit">
                  <IconButton onClick={() => handleOpenDialog(hostel)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Delete">
                  <IconButton onClick={() => handleDelete(hostel._id)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedHostel ? 'Edit Hostel' : 'Add New Hostel'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Hostel Name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Type</InputLabel>
                    <Select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as 'Boys' | 'Girls' | 'PG' })}
                      label="Type"
                      required
                    >
                      <MenuItem value="Boys">Boys</MenuItem>
                      <MenuItem value="Girls">Girls</MenuItem>
                      <MenuItem value="PG">PG</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Total Rooms"
                    value={formData.totalRooms}
                    onChange={(e) => setFormData({ ...formData, totalRooms: parseInt(e.target.value) || 0 })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Occupied Rooms"
                    value={formData.occupiedRooms}
                    onChange={(e) => setFormData({ ...formData, occupiedRooms: parseInt(e.target.value) || 0 })}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Location */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Location
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Building Name"
                    value={formData.location.building}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, building: e.target.value }
                    })}
                    required
                    error={!formData.location.building}
                    helperText={!formData.location.building ? "Building name is required" : ""}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Floor Number/Name"
                    value={formData.location.floor}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, floor: e.target.value }
                    })}
                    required
                    error={!formData.location.floor}
                    helperText={!formData.location.floor ? "Floor number/name is required" : ""}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Timings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Timings
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="In Time"
                    value={formData.timings.inTime}
                    onChange={(e) => setFormData({
                      ...formData,
                      timings: { ...formData.timings, inTime: e.target.value }
                    })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Out Time"
                    value={formData.timings.outTime}
                    onChange={(e) => setFormData({
                      ...formData,
                      timings: { ...formData.timings, outTime: e.target.value }
                    })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Visiting Hours"
                    value={formData.timings.visitingHours}
                    onChange={(e) => setFormData({
                      ...formData,
                      timings: { ...formData.timings, visitingHours: e.target.value }
                    })}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Fees */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Fee Structure
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Monthly Fee"
                    value={formData.fees.monthly}
                    onChange={(e) => setFormData({
                      ...formData,
                      fees: { ...formData.fees, monthly: parseInt(e.target.value) || 0 }
                    })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Security Deposit"
                    value={formData.fees.security}
                    onChange={(e) => setFormData({
                      ...formData,
                      fees: { ...formData.fees, security: parseInt(e.target.value) || 0 }
                    })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Mess Fee"
                    value={formData.fees.mess}
                    onChange={(e) => setFormData({
                      ...formData,
                      fees: { ...formData.fees, mess: parseInt(e.target.value) || 0 }
                    })}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Mess Details */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Mess Details
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel>Mess Type</InputLabel>
                    <Select
                      value={formData.messDetails.type}
                      onChange={(e) => setFormData({
                        ...formData,
                        messDetails: { ...formData.messDetails, type: e.target.value }
                      })}
                      label="Mess Type"
                    >
                      <MenuItem value="Vegetarian">Vegetarian</MenuItem>
                      <MenuItem value="Non-Vegetarian">Non-Vegetarian</MenuItem>
                      <MenuItem value="Both">Both</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Breakfast Time"
                    value={formData.messDetails.timings.breakfast}
                    onChange={(e) => setFormData({
                      ...formData,
                      messDetails: {
                        ...formData.messDetails,
                        timings: { ...formData.messDetails.timings, breakfast: e.target.value }
                      }
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Lunch Time"
                    value={formData.messDetails.timings.lunch}
                    onChange={(e) => setFormData({
                      ...formData,
                      messDetails: {
                        ...formData.messDetails,
                        timings: { ...formData.messDetails.timings, lunch: e.target.value }
                      }
                    })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Dinner Time"
                    value={formData.messDetails.timings.dinner}
                    onChange={(e) => setFormData({
                      ...formData,
                      messDetails: {
                        ...formData.messDetails,
                        timings: { ...formData.messDetails.timings, dinner: e.target.value }
                      }
                    })}
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Amenities */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Amenities
              </Typography>
              <Grid container spacing={2}>
                {Object.entries(formData.amenities).map(([key, value]) => (
                  <Grid item xs={12} sm={4} key={key}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={value}
                          onChange={(e) => setFormData({
                            ...formData,
                            amenities: { ...formData.amenities, [key]: e.target.checked }
                          })}
                        />
                      }
                      label={key.charAt(0).toUpperCase() + key.slice(1)}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Contact Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Warden Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Warden Name"
                    value={formData.contactInfo.warden.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo,
                        warden: { ...formData.contactInfo.warden, name: e.target.value }
                      }
                    })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Warden Phone"
                    value={formData.contactInfo.warden.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo,
                        warden: { ...formData.contactInfo.warden, phone: e.target.value }
                      }
                    })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Warden Email"
                    value={formData.contactInfo.warden.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo,
                        warden: { ...formData.contactInfo.warden, email: e.target.value }
                      }
                    })}
                    required
                  />
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Admin Details
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Admin Name"
                    value={formData.contactInfo.admin.name}
                    onChange={(e) => setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo,
                        admin: { ...formData.contactInfo.admin, name: e.target.value }
                      }
                    })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Admin Phone"
                    value={formData.contactInfo.admin.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo,
                        admin: { ...formData.contactInfo.admin, phone: e.target.value }
                      }
                    })}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    fullWidth
                    label="Admin Email"
                    value={formData.contactInfo.admin.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      contactInfo: {
                        ...formData.contactInfo,
                        admin: { ...formData.contactInfo.admin, email: e.target.value }
                      }
                    })}
                    required
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Rules */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Rules
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    multiline
                    rows={4}
                    label="Rules (One per line)"
                    value={formData.rules.join('\n')}
                    onChange={(e) => setFormData({
                      ...formData,
                      rules: e.target.value.split('\n').filter(rule => rule.trim() !== '')
                    })}
                    helperText="Enter each rule on a new line"
                  />
                </Grid>
              </Grid>
            </Grid>

            {/* Images */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom color="primary">
                Images
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Image URLs (One per line)"
                    multiline
                    rows={3}
                    value={formData.images.join('\n')}
                    onChange={(e) => setFormData({
                      ...formData,
                      images: e.target.value.split('\n').filter(url => url.trim() !== '')
                    })}
                    helperText="Enter each image URL on a new line"
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {selectedHostel ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default HostelManagement; 