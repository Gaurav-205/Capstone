import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Typography,
  Divider,
  Chip,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  School as SchoolIcon,
  Home as HomeIcon,
  Restaurant as RestaurantIcon,
  SportsHandball as SportsIcon,
  LocalLibrary as LibraryIcon,
  Science as ScienceIcon,
  Wifi as WifiIcon,
  LocalParking as ParkingIcon,
  AccessibilityNew as AccessibilityIcon,
  Info as InfoIcon,
  Email as EmailIcon,
  Web as WebIcon,
  LocalCafe as CafeIcon,
  LocalAtm as AtmIcon,
} from '@mui/icons-material';

interface Location {
  id: string;
  name: string;
  type: 'academic' | 'hostel' | 'mess' | 'library' | 'recreation' | 'health' | 'cafe' | 'atm';
  coordinates: [number, number];
  description: string;
  operatingHours?: string;
  contact?: string;
  email?: string;
  website?: string;
  wifi?: boolean;
  parking?: boolean;
  accessibility?: boolean;
  facilities?: string[];
}

interface LocationDialogProps {
  location: Location;
  open: boolean;
  onClose: () => void;
}

const getLocationIcon = (type: string) => {
  switch (type) {
    case 'academic':
      return <SchoolIcon />;
    case 'hostel':
      return <HomeIcon />;
    case 'mess':
      return <RestaurantIcon />;
    case 'library':
      return <LibraryIcon />;
    case 'recreation':
      return <SportsIcon />;
    case 'health':
      return <ScienceIcon />;
    case 'cafe':
      return <CafeIcon />;
    case 'atm':
      return <AtmIcon />;
    default:
      return <LocationIcon />;
  }
};

const LocationDialog: React.FC<LocationDialogProps> = ({ location, open, onClose }) => {
  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      aria-labelledby="location-dialog-title"
      aria-describedby="location-dialog-description"
    >
      <DialogTitle id="location-dialog-title">
        <Box display="flex" alignItems="center">
          {getLocationIcon(location.type)}
          <Typography variant="h6" sx={{ ml: 1 }}>
            {location.name}
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent id="location-dialog-description">
        <List>
          <ListItem>
            <ListItemIcon>
              <LocationIcon />
            </ListItemIcon>
            <ListItemText primary="Type" secondary={location.type} />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AccessTimeIcon />
            </ListItemIcon>
            <ListItemText primary="Operating Hours" secondary={location.operatingHours} />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PhoneIcon />
            </ListItemIcon>
            <ListItemText primary="Contact" secondary={location.contact} />
          </ListItem>
          {location.email && (
            <ListItem>
              <ListItemIcon>
                <EmailIcon />
              </ListItemIcon>
              <ListItemText primary="Email" secondary={location.email} />
            </ListItem>
          )}
          {location.website && (
            <ListItem>
              <ListItemIcon>
                <WebIcon />
              </ListItemIcon>
              <ListItemText 
                primary="Website" 
                secondary={
                  <a href={location.website} target="_blank" rel="noopener noreferrer">
                    {location.website}
                  </a>
                } 
              />
            </ListItem>
          )}
          <Divider />
          <ListItem>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText primary="Description" secondary={location.description} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemIcon>
              <WifiIcon />
            </ListItemIcon>
            <ListItemText primary="WiFi" secondary={location.wifi ? 'Available' : 'Not Available'} />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <ParkingIcon />
            </ListItemIcon>
            <ListItemText primary="Parking" secondary={location.parking ? 'Available' : 'Not Available'} />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <AccessibilityIcon />
            </ListItemIcon>
            <ListItemText primary="Accessibility" secondary={location.accessibility ? 'Accessible' : 'Not Accessible'} />
          </ListItem>
          {location.facilities && location.facilities.length > 0 && (
            <>
              <Divider />
              <ListItem>
                <ListItemText 
                  primary="Facilities" 
                  secondary={
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {location.facilities.map((facility, index) => (
                        <Chip key={index} label={facility} size="small" />
                      ))}
                    </Box>
                  }
                />
              </ListItem>
            </>
          )}
        </List>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose}
          aria-label="Close location details"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LocationDialog; 