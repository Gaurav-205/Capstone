import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Paper,
  Button,
  Chip,
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
  Stack,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Badge,
  Avatar,
} from '@mui/material';
import {
  LocationOn,
  Hotel,
  LocalLaundryService,
  Kitchen,
  Wifi,
  CleaningServices,
  LocalParking,
  Security,
  PowerSettingsNew,
  Elevator,
  AcUnit,
  Person,
  Info,
  Close,
  DirectionsBus,
  LocalHospital,
  LocalLibrary,
  Computer,
  Restaurant,
  AccessTime,
  LocalDining,
  MonetizationOn,
  Phone,
  Email,
  EventAvailable,
  SportsEsports,
  Bed,
} from '@mui/icons-material';
import axios from 'axios';
import { API_URL } from '../config';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface HostelDetails {
  _id: string;
  name: string;
  type: 'boys' | 'girls';
  totalRooms: number;
  occupiedRooms: number;
  location: {
    building: string;
    floor: string;
  };
  contactInfo: {
    warden: {
      name: string;
      phone: string;
      email: string;
    };
  };
  facilities: string[];
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
  rules: string[];
  timings?: {
    inTime?: string;
    outTime?: string;
    visitingHours?: string;
  };
  fees?: {
    monthly?: number;
    security?: number;
    mess?: number;
  };
  messDetails?: {
    type?: string;
    timings?: {
      breakfast?: string;
      lunch?: string;
      dinner?: string;
    };
    menu?: {
      [key: string]: string[];
    };
  };
  images?: string[];
}

const facilities = [
  {
    name: 'Library',
    description: '24/7 access with dedicated study areas and digital resources.',
    features: [
      'Digital Library Access',
      'Individual Study Rooms',
      'Group Discussion Areas',
      'Online Journal Access',
      'Printing & Scanning Services',
    ],
    timings: '24/7',
    contact: {
      inCharge: 'Dr. Amit Sharma',
      phone: '+91-9876543212',
      email: 'library@university.edu',
    },
  },
  {
    name: 'Sports Complex',
    description: 'Indoor and outdoor facilities for various sports activities.',
    features: [
      'Indoor Gymnasium',
      'Basketball Court',
      'Badminton Courts',
      'Table Tennis',
      'Cricket Ground',
      'Football Field',
    ],
    timings: '6:00 AM - 10:00 PM',
    contact: {
      inCharge: 'Mr. Rahul Verma',
      phone: '+91-9876543213',
      email: 'sports@university.edu',
    },
  },
  {
    name: 'Medical Center',
    description: '24/7 medical assistance with qualified healthcare professionals.',
    features: [
      'Emergency Services',
      'General OPD',
      'Pharmacy',
      'Ambulance Service',
      'Mental Health Counseling',
    ],
    timings: '24/7',
    contact: {
      inCharge: 'Dr. Meera Patel',
      phone: '+91-9876543214',
      email: 'medical@university.edu',
    },
  },
];

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const getAmenityIcon = (name: string) => {
  switch (name) {
    case 'wifi': return <Wifi />;
    case 'laundry': return <LocalLaundryService />;
    case 'mess': return <Kitchen />;
    case 'cleaning': return <CleaningServices />;
    case 'parking': return <LocalParking />;
    case 'security': return <Security />;
    case 'transport': return <DirectionsBus />;
    case 'medical': return <LocalHospital />;
    case 'library': return <LocalLibrary />;
    case 'computer': return <Computer />;
    default: return null;
  }
};

const HostelFacility = () => {
  const [value, setValue] = useState(0);
  const [hostels, setHostels] = useState<HostelDetails[]>([]);
  const [selectedHostel, setSelectedHostel] = useState<HostelDetails | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchHostels();
  }, []);

  const fetchHostels = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/hostels`);
      setHostels(response.data);
      setError(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch hostels');
      console.error('Error fetching hostels:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  const handleHostelClick = (hostel: HostelDetails) => {
    setSelectedHostel(hostel);
  };

  const handleFacilityClick = (index: number) => {
    setSelectedFacility(index);
  };

  return (
    <Box sx={{ width: '100%', p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 600, color: '#1976d2', mb: 3 }}>
        Hostel & Facilities
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 4 }}>
        <Tabs 
          value={value} 
          onChange={handleTabChange}
          sx={{
            '& .MuiTab-root': {
              fontSize: '1rem',
              fontWeight: 500,
            }
          }}
        >
          <Tab label="HOSTELS" />
          <Tab label="FACILITIES" />
        </Tabs>
      </Box>

      <TabPanel value={value} index={0}>
        <Grid container spacing={4}>
          {hostels.map((hostel) => (
            <Grid item xs={12} md={6} key={hostel._id}>
              <Card
                elevation={3}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 2,
                  overflow: 'hidden',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={hostel.images?.[0] || 'https://source.unsplash.com/random?hostel'}
                  alt={hostel.name}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: '#2c3e50' }}>
                      {hostel.name}
                    </Typography>
                    <Chip
                      label={hostel.type === 'boys' ? 'Boys' : 'Girls'}
                      color={hostel.type === 'boys' ? 'success' : 'secondary'}
                      sx={{ 
                        fontWeight: 500,
                        fontSize: '0.9rem',
                        px: 1
                      }}
                    />
                  </Box>

                  <Stack spacing={2}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      bgcolor: '#f5f5f5',
                      p: 1.5,
                      borderRadius: 1
                    }}>
                      <Hotel sx={{ mr: 2, color: '#1976d2' }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          Rooms: {hostel.totalRooms - hostel.occupiedRooms}/{hostel.totalRooms} Available
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {Math.round(((hostel.totalRooms - hostel.occupiedRooms) / hostel.totalRooms) * 100)}% Vacancy
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      bgcolor: '#f5f5f5',
                      p: 1.5,
                      borderRadius: 1
                    }}>
                      <LocationOn sx={{ mr: 2, color: '#1976d2' }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                          {hostel.location.building}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {hostel.location.floor}
                        </Typography>
                      </Box>
                    </Box>

                    {hostel.timings && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        bgcolor: '#f5f5f5',
                        p: 1.5,
                        borderRadius: 1
                      }}>
                        <AccessTime sx={{ mr: 2, color: '#1976d2' }} />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                            In: {hostel.timings.inTime} | Out: {hostel.timings.outTime}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Visiting Hours: {hostel.timings.visitingHours}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {hostel.fees && (
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        bgcolor: '#f5f5f5',
                        p: 1.5,
                        borderRadius: 1
                      }}>
                        <MonetizationOn sx={{ mr: 2, color: '#1976d2' }} />
                        <Box>
                          <Typography variant="body1" sx={{ fontWeight: 500, color: '#2c3e50' }}>
                            Monthly Fee: ₹{hostel.fees.monthly?.toLocaleString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Security: ₹{hostel.fees.security?.toLocaleString()} | Mess: ₹{hostel.fees.mess?.toLocaleString()}/month
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    <Divider sx={{ my: 1 }} />

                    <Box>
                      <Typography variant="subtitle1" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                        Key Features
                      </Typography>
                      <Grid container spacing={1}>
                        {hostel.amenities.mess && (
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: '#2c3e50' }}>
                              <Restaurant sx={{ mr: 1, fontSize: 20 }} />
                              <Typography variant="body2">Dedicated Mess</Typography>
                            </Box>
                          </Grid>
                        )}
                        {hostel.amenities.medical && (
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: '#2c3e50' }}>
                              <LocalHospital sx={{ mr: 1, fontSize: 20 }} />
                              <Typography variant="body2">Medical Care</Typography>
                            </Box>
                          </Grid>
                        )}
                        {hostel.amenities.sports && (
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: '#2c3e50' }}>
                              <SportsEsports sx={{ mr: 1, fontSize: 20 }} />
                              <Typography variant="body2">Sports Facility</Typography>
                            </Box>
                          </Grid>
                        )}
                        {hostel.amenities.library && (
                          <Grid item xs={6}>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: '#2c3e50' }}>
                              <LocalLibrary sx={{ mr: 1, fontSize: 20 }} />
                              <Typography variant="body2">Library Access</Typography>
                            </Box>
                          </Grid>
                        )}
                      </Grid>
                    </Box>

                    <Button
                      variant="contained"
                      onClick={() => setSelectedHostel(hostel)}
                      sx={{
                        mt: 2,
                        bgcolor: '#1976d2',
                        '&:hover': {
                          bgcolor: '#1565c0'
                        }
                      }}
                    >
                      View Details
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <TabPanel value={value} index={1}>
        <Grid container spacing={3}>
          {facilities.map((facility, index) => (
            <Grid item xs={12} md={4} key={facility.name}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  height: '100%',
                  borderRadius: 2,
                  bgcolor: '#fff',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => handleFacilityClick(index)}
              >
                <Typography variant="h6" gutterBottom>
                  {facility.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {facility.description}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Info sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {facility.timings}
                  </Typography>
                </Box>
                <Button 
                  variant="outlined" 
                  size="small"
                  sx={{ 
                    color: '#4CAF50',
                    borderColor: '#4CAF50',
                    '&:hover': {
                      borderColor: '#388E3C',
                      bgcolor: 'rgba(76, 175, 80, 0.04)',
                    },
                  }}
                >
                  View Details
                </Button>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      <Dialog
        open={!!selectedHostel}
        onClose={() => setSelectedHostel(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedHostel && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>{selectedHostel.name}</Typography>
                <IconButton onClick={() => setSelectedHostel(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Box sx={{ position: 'relative', height: 300, mb: 3 }}>
                    <CardMedia
                      component="img"
                      height="300"
                      image={selectedHostel.images?.[0] || 'https://source.unsplash.com/random?hostel'}
                      alt={selectedHostel.name}
                      sx={{ borderRadius: 1 }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                    General Information
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <List>
                      <ListItem>
                        <ListItemIcon><LocationOn color="primary" /></ListItemIcon>
                        <ListItemText 
                          primary="Location" 
                          secondary={`${selectedHostel.location.building}, ${selectedHostel.location.floor}`}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Bed color="primary" /></ListItemIcon>
                        <ListItemText 
                          primary="Room Availability" 
                          secondary={`${selectedHostel.totalRooms - selectedHostel.occupiedRooms} out of ${selectedHostel.totalRooms} rooms available`}
                        />
                      </ListItem>
                      {selectedHostel.fees && (
                        <ListItem>
                          <ListItemIcon><MonetizationOn color="primary" /></ListItemIcon>
                          <ListItemText 
                            primary="Fee Structure" 
                            secondary={
                              <>
                                <Typography variant="body2">Monthly: ₹{selectedHostel.fees.monthly?.toLocaleString()}</Typography>
                                <Typography variant="body2">Security: ₹{selectedHostel.fees.security?.toLocaleString()}</Typography>
                                <Typography variant="body2">Mess: ₹{selectedHostel.fees.mess?.toLocaleString()}/month</Typography>
                              </>
                            }
                          />
                        </ListItem>
                      )}
                    </List>
                  </Paper>

                  {selectedHostel.timings && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 600, mt: 3 }}>
                        Timings
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <List>
                          <ListItem>
                            <ListItemIcon><EventAvailable color="primary" /></ListItemIcon>
                            <ListItemText 
                              primary="Hostel Timings"
                              secondary={
                                <>
                                  <Typography variant="body2">In Time: {selectedHostel.timings.inTime}</Typography>
                                  <Typography variant="body2">Out Time: {selectedHostel.timings.outTime}</Typography>
                                  <Typography variant="body2">Visiting Hours: {selectedHostel.timings.visitingHours}</Typography>
                                </>
                              }
                            />
                          </ListItem>
                        </List>
                      </Paper>
                    </>
                  )}

                  {selectedHostel.messDetails && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 600, mt: 3 }}>
                        Mess Information
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <List>
                          <ListItem>
                            <ListItemIcon><LocalDining color="primary" /></ListItemIcon>
                            <ListItemText 
                              primary={`Mess Type: ${selectedHostel.messDetails.type}`}
                              secondary={
                                <>
                                  <Typography variant="body2">Breakfast: {selectedHostel.messDetails.timings?.breakfast}</Typography>
                                  <Typography variant="body2">Lunch: {selectedHostel.messDetails.timings?.lunch}</Typography>
                                  <Typography variant="body2">Dinner: {selectedHostel.messDetails.timings?.dinner}</Typography>
                                </>
                              }
                            />
                          </ListItem>
                        </List>
                      </Paper>
                    </>
                  )}
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 600 }}>
                    Contact Information
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <List>
                      <ListItem>
                        <ListItemIcon><Person color="primary" /></ListItemIcon>
                        <ListItemText 
                          primary="Warden"
                          secondary={selectedHostel.contactInfo.warden.name}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Phone color="primary" /></ListItemIcon>
                        <ListItemText 
                          primary="Phone"
                          secondary={selectedHostel.contactInfo.warden.phone}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Email color="primary" /></ListItemIcon>
                        <ListItemText 
                          primary="Email"
                          secondary={selectedHostel.contactInfo.warden.email}
                        />
                      </ListItem>
                    </List>
                  </Paper>

                  <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 600, mt: 3 }}>
                    Amenities
                  </Typography>
                  <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                    <Grid container spacing={2}>
                      {Object.entries(selectedHostel.amenities).map(([key, value]) => 
                        value ? (
                          <Grid item xs={6} key={key}>
                            <Box sx={{ 
                              display: 'flex', 
                              alignItems: 'center',
                              p: 1,
                              borderRadius: 1,
                              bgcolor: '#fff'
                            }}>
                              {getAmenityIcon(key)}
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  ml: 1,
                                  fontWeight: 500,
                                  textTransform: 'capitalize'
                                }}
                              >
                                {key}
                              </Typography>
                            </Box>
                          </Grid>
                        ) : null
                      )}
                    </Grid>
                  </Paper>

                  {selectedHostel.rules && selectedHostel.rules.length > 0 && (
                    <>
                      <Typography variant="h6" gutterBottom sx={{ color: '#1976d2', fontWeight: 600, mt: 3 }}>
                        Rules & Regulations
                      </Typography>
                      <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                        <List dense>
                          {selectedHostel.rules.map((rule, index) => (
                            <ListItem key={index}>
                              <ListItemText primary={rule} />
                            </ListItem>
                          ))}
                        </List>
                      </Paper>
                    </>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedHostel(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Dialog
        open={selectedFacility !== null}
        onClose={() => setSelectedFacility(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedFacility !== null && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Typography variant="h6">{facilities[selectedFacility].name}</Typography>
                <IconButton onClick={() => setSelectedFacility(null)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body1" paragraph>
                {facilities[selectedFacility].description}
              </Typography>
              
              <Typography variant="subtitle1" gutterBottom>
                Features
              </Typography>
              <List dense>
                {facilities[selectedFacility].features.map((feature, index) => (
                  <ListItem key={index}>
                    <ListItemText primary={feature} />
                  </ListItem>
                ))}
              </List>

              <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                Contact Information
              </Typography>
              <List>
                <ListItem>
                  <ListItemText 
                    primary="In-charge" 
                    secondary={facilities[selectedFacility].contact.inCharge}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Phone" 
                    secondary={facilities[selectedFacility].contact.phone}
                  />
                </ListItem>
                <ListItem>
                  <ListItemText 
                    primary="Email" 
                    secondary={facilities[selectedFacility].contact.email}
                  />
                </ListItem>
              </List>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedFacility(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <CircularProgress />
        </Box>
      )}
      {error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
};

export default HostelFacility; 