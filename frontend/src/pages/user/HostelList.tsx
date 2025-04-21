import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Alert,
  IconButton,
  Rating,
  Divider
} from '@mui/material';
import {
  LocationOn,
  Phone,
  Email,
  Person,
  Hotel,
  AttachMoney,
  Close,
  Wifi,
  LocalLaundryService,
  Restaurant,
  SportsSoccer,
  Security,
  CleaningServices,
  DirectionsBus,
  LocalParking,
  LocalHospital,
  LocalLibrary,
  Computer
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../../config';

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

const HostelList: React.FC = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/hostels`);
      setHostels(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch hostels');
      console.error('Error fetching hostels:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAvailabilityColor = (occupied: number, total: number) => {
    const percentage = (occupied / total) * 100;
    if (percentage >= 90) return 'error';
    if (percentage >= 70) return 'warning';
    return 'success';
  };

  const getAmenityIcon = (name: string) => {
    switch (name) {
      case 'wifi': return <Wifi />;
      case 'laundry': return <LocalLaundryService />;
      case 'mess': return <Restaurant />;
      case 'sports': return <SportsSoccer />;
      case 'security': return <Security />;
      case 'cleaning': return <CleaningServices />;
      case 'transport': return <DirectionsBus />;
      case 'parking': return <LocalParking />;
      case 'medical': return <LocalHospital />;
      case 'library': return <LocalLibrary />;
      case 'computer': return <Computer />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
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
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1976d2' }}>
        Hostels
      </Typography>

      <Grid container spacing={3}>
        {hostels.map((hostel) => (
          <Grid item xs={12} sm={6} md={4} key={hostel._id}>
            <Card sx={{ 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                transform: 'translateY(-2px)',
                transition: 'all 0.3s ease'
              }
            }}>
              <CardMedia
                component="img"
                height="200"
                image={hostel.images[0] || 'https://source.unsplash.com/random?hostel'}
                alt={hostel.name}
                sx={{ objectFit: 'cover' }}
              />
              <CardContent sx={{ p: 2.5 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" component="div" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                    {hostel.name}
                  </Typography>
                  <Chip
                    label={hostel.type}
                    color={hostel.type === 'Boys' ? 'success' : 'secondary'}
                    size="small"
                    sx={{ 
                      fontWeight: 500,
                      px: 1,
                      backgroundColor: hostel.type === 'Boys' ? '#4caf50' : '#e91e63',
                      color: 'white'
                    }}
                  />
                </Box>

                <Box sx={{ mb: 2.5 }}>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    mb: 1.5,
                    backgroundColor: '#f5f5f5',
                    p: 1,
                    borderRadius: 1
                  }}>
                    <LocationOn sx={{ mr: 1, fontSize: 20, color: '#1976d2' }} />
                    <Typography variant="body2" sx={{ color: '#2c3e50', fontWeight: 500 }}>
                      {hostel.location.building}, {hostel.location.floor}
                    </Typography>
                  </Box>
                  <Box sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    backgroundColor: '#f5f5f5',
                    p: 1,
                    borderRadius: 1
                  }}>
                    <Hotel sx={{ mr: 1, fontSize: 20, color: '#1976d2' }} />
                    <Typography variant="body2" sx={{ color: '#2c3e50', fontWeight: 500 }}>
                      Rooms: {hostel.occupiedRooms}/{hostel.totalRooms}
                    </Typography>
                    <Chip
                      label={`${Math.round((hostel.occupiedRooms / hostel.totalRooms) * 100)}% Occupied`}
                      color={getAvailabilityColor(hostel.occupiedRooms, hostel.totalRooms)}
                      size="small"
                      sx={{ ml: 1, fontWeight: 500 }}
                    />
                  </Box>
                </Box>

                <Box sx={{ mb: 2.5 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                    Available Amenities
                  </Typography>
                  <Grid container spacing={1}>
                    {Object.entries(hostel.amenities).map(([key, value]) => (
                      value && (
                        <Grid item xs={6} key={key}>
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center',
                            backgroundColor: '#f5f5f5',
                            p: 0.5,
                            borderRadius: 1,
                            '&:hover': {
                              backgroundColor: '#e3f2fd'
                            }
                          }}>
                            {getAmenityIcon(key)}
                            <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize', fontSize: '0.875rem' }}>
                              {key}
                            </Typography>
                          </Box>
                        </Grid>
                      )
                    ))}
                  </Grid>
                </Box>

                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                    Rating
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f5', p: 1, borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ mr: 1, color: '#2c3e50' }}>Overall:</Typography>
                    <Rating value={hostel.ratings.overall} readOnly size="small" />
                    <Typography variant="body2" sx={{ ml: 1, color: '#2c3e50', fontWeight: 500 }}>
                      ({hostel.ratings.overall.toFixed(1)})
                    </Typography>
                  </Box>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setSelectedHostel(hostel)}
                  sx={{ 
                    mt: 'auto',
                    backgroundColor: '#1976d2',
                    '&:hover': {
                      backgroundColor: '#1565c0'
                    }
                  }}
                >
                  View Details
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Hostel Details Dialog */}
      <Dialog
        open={!!selectedHostel}
        onClose={() => setSelectedHostel(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedHostel && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography variant="h6">{selectedHostel.name}</Typography>
                <IconButton onClick={() => setSelectedHostel(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Contact Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><Person /></ListItemIcon>
                      <ListItemText
                        primary="Warden"
                        secondary={selectedHostel.contactInfo.warden.name}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Phone /></ListItemIcon>
                      <ListItemText
                        primary="Phone"
                        secondary={selectedHostel.contactInfo.warden.phone}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Email /></ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={selectedHostel.contactInfo.warden.email}
                      />
                    </ListItem>
                  </List>

                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Fees
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><AttachMoney /></ListItemIcon>
                      <ListItemText
                        primary="Monthly Fee"
                        secondary={`₹${selectedHostel.fees.monthly}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><AttachMoney /></ListItemIcon>
                      <ListItemText
                        primary="Security Deposit"
                        secondary={`₹${selectedHostel.fees.security}`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><AttachMoney /></ListItemIcon>
                      <ListItemText
                        primary="Mess Fee"
                        secondary={`₹${selectedHostel.fees.mess}`}
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Ratings
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Grid container spacing={1}>
                      {Object.entries(selectedHostel.ratings).map(([key, value]) => (
                        <Grid item xs={12} key={key}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <Typography variant="body2" sx={{ minWidth: 100, textTransform: 'capitalize' }}>
                              {key}:
                            </Typography>
                            <Rating value={value} readOnly size="small" />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" gutterBottom>
                    Amenities
                  </Typography>
                  <Grid container spacing={1}>
                    {Object.entries(selectedHostel.amenities).map(([key, value]) => (
                      value && (
                        <Grid item xs={6} key={key}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getAmenityIcon(key)}
                            <Typography variant="body2" sx={{ ml: 1, textTransform: 'capitalize' }}>
                              {key}
                            </Typography>
                          </Box>
                        </Grid>
                      )
                    ))}
                  </Grid>
                </Grid>

                {selectedHostel.rules.length > 0 && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Rules
                    </Typography>
                    <List dense>
                      {selectedHostel.rules.map((rule, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={rule} />
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                )}
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedHostel(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default HostelList; 