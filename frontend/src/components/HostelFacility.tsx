import React, { useState } from 'react';
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
  Bed,
  Person,
  Info,
  Close,
} from '@mui/icons-material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface HostelDetails {
  id: string;
  name: string;
  type: 'boys' | 'girls';
  totalRooms: number;
  availableRooms: number;
  location: string;
  facilities: string[];
  amenities: {
    name: string;
    icon: React.ReactNode;
    status: 'available' | 'maintenance' | 'unavailable';
  }[];
  rules: string[];
  timings: {
    inTime: string;
    outTime: string;
    visitingHours: string;
  };
  contact: {
    warden: string;
    phone: string;
    email: string;
  };
}

const hostels: HostelDetails[] = [
  {
    id: 'bh-a',
    name: 'Boys Hostel A',
    type: 'boys',
    totalRooms: 100,
    availableRooms: 15,
    location: 'Block A, Ground to 3rd Floor',
    facilities: ['Single Rooms', 'Double Rooms', 'Common Room', 'Study Area'],
    amenities: [
      { name: 'Wi-Fi', icon: <Wifi />, status: 'available' },
      { name: 'Laundry', icon: <LocalLaundryService />, status: 'available' },
      { name: 'Kitchen', icon: <Kitchen />, status: 'maintenance' },
      { name: 'Cleaning', icon: <CleaningServices />, status: 'available' },
      { name: 'Parking', icon: <LocalParking />, status: 'available' },
      { name: 'Security', icon: <Security />, status: 'available' },
      { name: 'Power Backup', icon: <PowerSettingsNew />, status: 'available' },
      { name: 'Elevator', icon: <Elevator />, status: 'available' },
      { name: 'AC', icon: <AcUnit />, status: 'available' },
    ],
    rules: [
      'No visitors allowed after 8 PM',
      'Maintain silence in study areas',
      'Keep rooms clean and tidy',
      'No cooking in rooms',
      'Report maintenance issues immediately',
    ],
    timings: {
      inTime: '10:00 PM',
      outTime: '6:00 AM',
      visitingHours: '4:00 PM - 8:00 PM',
    },
    contact: {
      warden: 'Dr. Rajesh Kumar',
      phone: '+91-9876543210',
      email: 'warden.bha@university.edu',
    },
  },
  {
    id: 'gh-b',
    name: 'Girls Hostel B',
    type: 'girls',
    totalRooms: 80,
    availableRooms: 5,
    location: 'Block B, Ground to 3rd Floor',
    facilities: ['Single Rooms', 'Double Rooms', 'Common Room', 'Study Area', 'Indoor Gym'],
    amenities: [
      { name: 'Wi-Fi', icon: <Wifi />, status: 'available' },
      { name: 'Laundry', icon: <LocalLaundryService />, status: 'available' },
      { name: 'Kitchen', icon: <Kitchen />, status: 'available' },
      { name: 'Cleaning', icon: <CleaningServices />, status: 'available' },
      { name: 'Parking', icon: <LocalParking />, status: 'available' },
      { name: 'Security', icon: <Security />, status: 'available' },
      { name: 'Power Backup', icon: <PowerSettingsNew />, status: 'available' },
      { name: 'Elevator', icon: <Elevator />, status: 'maintenance' },
      { name: 'AC', icon: <AcUnit />, status: 'available' },
    ],
    rules: [
      'No visitors allowed after 7 PM',
      'Maintain silence in study areas',
      'Keep rooms clean and tidy',
      'No cooking in rooms',
      'Report maintenance issues immediately',
    ],
    timings: {
      inTime: '9:00 PM',
      outTime: '6:00 AM',
      visitingHours: '4:00 PM - 7:00 PM',
    },
    contact: {
      warden: 'Dr. Priya Singh',
      phone: '+91-9876543211',
      email: 'warden.ghb@university.edu',
    },
  },
];

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

const HostelFacility = () => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedHostel, setSelectedHostel] = useState<HostelDetails | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleHostelClick = (hostel: HostelDetails) => {
    setSelectedHostel(hostel);
  };

  const handleFacilityClick = (index: number) => {
    setSelectedFacility(index);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Hostel & Facilities
      </Typography>

      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <Tab label="HOSTELS" />
        <Tab label="FACILITIES" />
      </Tabs>

      {/* Hostels Tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {hostels.map((hostel) => (
            <Grid item xs={12} md={6} key={hostel.id}>
              <Paper 
                elevation={0}
                sx={{ 
                  p: 3, 
                  height: '100%',
                  borderRadius: 2,
                  bgcolor: '#fff',
                  position: 'relative',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  },
                }}
                onClick={() => handleHostelClick(hostel)}
              >
                <Chip 
                  label={hostel.type === 'boys' ? 'Boys' : 'Girls'} 
                  color={hostel.type === 'boys' ? 'primary' : 'secondary'} 
                  size="small" 
                  sx={{ 
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: hostel.type === 'boys' ? '#4CAF50' : '#9C27B0',
                  }}
                />
                <Typography variant="h6" gutterBottom>
                  {hostel.name}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Hotel sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    Rooms: {hostel.availableRooms}/{hostel.totalRooms}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <LocationOn sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {hostel.location}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                  {hostel.amenities.slice(0, 4).map((amenity) => (
                    <Tooltip key={amenity.name} title={amenity.name}>
                      <IconButton
                        size="small"
                        sx={{
                          color: amenity.status === 'available' ? 'success.main' :
                                amenity.status === 'maintenance' ? 'warning.main' : 'error.main',
                        }}
                      >
                        {amenity.icon}
                      </IconButton>
                    </Tooltip>
                  ))}
                  {hostel.amenities.length > 4 && (
                    <Chip
                      label={`+${hostel.amenities.length - 4}`}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </TabPanel>

      {/* Facilities Tab */}
      <TabPanel value={tabValue} index={1}>
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
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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
                    General Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon><LocationOn /></ListItemIcon>
                      <ListItemText 
                        primary="Location" 
                        secondary={selectedHostel.location}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Person /></ListItemIcon>
                      <ListItemText 
                        primary="Warden" 
                        secondary={selectedHostel.contact.warden}
                      />
                    </ListItem>
                  </List>

                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                    Timings
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText 
                        primary="In Time" 
                        secondary={selectedHostel.timings.inTime}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Out Time" 
                        secondary={selectedHostel.timings.outTime}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText 
                        primary="Visiting Hours" 
                        secondary={selectedHostel.timings.visitingHours}
                      />
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Amenities
                  </Typography>
                  <Grid container spacing={1}>
                    {selectedHostel.amenities.map((amenity) => (
                      <Grid item xs={4} key={amenity.name}>
                        <Paper
                          sx={{
                            p: 1,
                            textAlign: 'center',
                            bgcolor: amenity.status === 'available' ? 'success.light' :
                                   amenity.status === 'maintenance' ? 'warning.light' : 'error.light',
                          }}
                        >
                          {amenity.icon}
                          <Typography variant="caption" display="block">
                            {amenity.name}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>

                  <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                    Rules & Regulations
                  </Typography>
                  <List dense>
                    {selectedHostel.rules.map((rule, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={rule} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedHostel(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Facility Details Dialog */}
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

      {/* Loading and Error States */}
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