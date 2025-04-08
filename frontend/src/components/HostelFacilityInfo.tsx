import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  CardMedia
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  Phone,
  Email,
  Person,
  Bed,
  MeetingRoom,
  LibraryBooks,
  Science,
  FitnessCenter,
  SportsSoccer,
  TheaterComedy,
  Groups
} from '@mui/icons-material';
import { dummyHostels, dummyFacilities } from '../data/dummyData';

interface Hostel {
  _id: string;
  name: string;
  type: string;
  totalRooms: number;
  occupiedRooms: number;
  location: {
    building: string;
    floor: string;
    coordinates: {
      lat: number;
      lng: number;
    }
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
    }
  };
  facilities: Array<{
    name: string;
    description: string;
    isAvailable: boolean;
  }>;
  rules: string[];
  images: string[];
}

interface Facility {
  _id: string;
  name: string;
  type: string;
  description: string;
  location: {
    building: string;
    floor: string;
    coordinates: {
      lat: number;
      lng: number;
    }
  };
  operatingHours: {
    monday: { open: string; close: string };
    tuesday: { open: string; close: string };
    wednesday: { open: string; close: string };
    thursday: { open: string; close: string };
    friday: { open: string; close: string };
    saturday: { open: string; close: string };
    sunday: { open: string; close: string }
  };
  isOpen: boolean;
  specialAccess: {
    required: boolean;
    description: string;
  };
  contactInfo: {
    inCharge: {
      name: string;
      phone: string;
      email: string;
    }
  };
  images: string[];
  rules: string[];
}

const HostelFacilityInfo: React.FC = () => {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate API call with dummy data
    const fetchData = async () => {
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        setHostels(dummyHostels);
        setFacilities(dummyFacilities);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedTab(newValue);
  };

  const getFacilityIcon = (type: string) => {
    switch (type) {
      case 'Library':
        return <LibraryBooks />;
      case 'Lab':
        return <Science />;
      case 'Gym':
        return <FitnessCenter />;
      case 'Sports':
        return <SportsSoccer />;
      case 'Auditorium':
        return <TheaterComedy />;
      case 'Common Room':
        return <Groups />;
      default:
        return <MeetingRoom />;
    }
  };

  const getDayAbbreviation = (day: string) => {
    return day.substring(0, 3);
  };

  if (loading) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Hostel & Facility Information
      </Typography>

      <Tabs value={selectedTab} onChange={handleTabChange} sx={{ mb: 3 }}>
        <Tab label="Hostels" />
        <Tab label="Facilities" />
      </Tabs>

      {selectedTab === 0 && (
        <Grid container spacing={3}>
          {hostels.map((hostel) => (
            <Grid item xs={12} md={6} lg={4} key={hostel._id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={hostel.images[0] || 'https://via.placeholder.com/300x200'}
                  alt={hostel.name}
                />
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {hostel.name}
                  </Typography>
                  <Chip
                    label={hostel.type}
                    color="primary"
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {hostel.location.building}, {hostel.location.floor}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSelectedHostel(hostel)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {selectedTab === 1 && (
        <Grid container spacing={3}>
          {facilities.map((facility) => (
            <Grid item xs={12} md={6} lg={4} key={facility._id}>
              <Card>
                <CardMedia
                  component="img"
                  height="200"
                  image={facility.images[0] || 'https://via.placeholder.com/300x200'}
                  alt={facility.name}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getFacilityIcon(facility.type)}
                    <Typography variant="h6" sx={{ ml: 1 }}>
                      {facility.name}
                    </Typography>
                  </Box>
                  <Chip
                    label={facility.isOpen ? 'Open' : 'Closed'}
                    color={facility.isOpen ? 'success' : 'error'}
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {facility.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <LocationOn sx={{ mr: 1 }} />
                    <Typography variant="body2">
                      {facility.location.building}, {facility.location.floor}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => setSelectedFacility(facility)}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Hostel Details Dialog */}
      <Dialog
        open={!!selectedHostel}
        onClose={() => setSelectedHostel(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedHostel && (
          <>
            <DialogTitle>{selectedHostel.name}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Contact Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Person />
                      </ListItemIcon>
                      <ListItemText
                        primary="Warden"
                        secondary={selectedHostel.contactInfo.warden.name}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Phone />
                      </ListItemIcon>
                      <ListItemText
                        primary="Warden Phone"
                        secondary={selectedHostel.contactInfo.warden.phone}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Email />
                      </ListItemIcon>
                      <ListItemText
                        primary="Warden Email"
                        secondary={selectedHostel.contactInfo.warden.email}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Facilities
                  </Typography>
                  <List>
                    {selectedHostel.facilities.map((facility, index) => (
                      <ListItem key={index}>
                        <ListItemIcon>
                          <MeetingRoom />
                        </ListItemIcon>
                        <ListItemText
                          primary={facility.name}
                          secondary={facility.description}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Rules
                  </Typography>
                  <List>
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
        open={!!selectedFacility}
        onClose={() => setSelectedFacility(null)}
        maxWidth="md"
        fullWidth
      >
        {selectedFacility && (
          <>
            <DialogTitle>{selectedFacility.name}</DialogTitle>
            <DialogContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Operating Hours
                  </Typography>
                  <List>
                    {Object.entries(selectedFacility.operatingHours).map(([day, hours]) => (
                      <ListItem key={day}>
                        <ListItemIcon>
                          <AccessTime />
                        </ListItemIcon>
                        <ListItemText
                          primary={getDayAbbreviation(day)}
                          secondary={`${hours.open} - ${hours.close}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle1" gutterBottom>
                    Contact Information
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemIcon>
                        <Person />
                      </ListItemIcon>
                      <ListItemText
                        primary="In Charge"
                        secondary={selectedFacility.contactInfo.inCharge.name}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Phone />
                      </ListItemIcon>
                      <ListItemText
                        primary="Phone"
                        secondary={selectedFacility.contactInfo.inCharge.phone}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon>
                        <Email />
                      </ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={selectedFacility.contactInfo.inCharge.email}
                      />
                    </ListItem>
                  </List>
                </Grid>
                {selectedFacility.specialAccess.required && (
                  <Grid item xs={12}>
                    <Typography variant="subtitle1" gutterBottom>
                      Special Access Requirements
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedFacility.specialAccess.description}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle1" gutterBottom>
                    Rules
                  </Typography>
                  <List>
                    {selectedFacility.rules.map((rule, index) => (
                      <ListItem key={index}>
                        <ListItemText primary={rule} />
                      </ListItem>
                    ))}
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedFacility(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default HostelFacilityInfo; 