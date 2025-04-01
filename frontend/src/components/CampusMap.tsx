import React, { useState, useCallback } from 'react';
import ReactMapGL, { 
  Marker, 
  Popup, 
  NavigationControl, 
  FullscreenControl, 
  GeolocateControl,
  MapLayerMouseEvent,
  ViewStateChangeEvent
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
  Drawer,
  Grid,
  Rating,
  SelectChangeEvent,
  ListItemButton,
  Collapse,
  Fade,
  Popper,
  Grow,
} from '@mui/material';
import {
  School,
  LocalLibrary,
  SportsSoccer,
  LocalHospital,
  Restaurant,
  LocalParking,
  Info,
  Close,
  Search,
  DirectionsWalk,
  DirectionsBike,
  DirectionsCar,
  Menu as MenuIcon,
  AccessTime,
  Phone,
  Email,
  Web,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  LocationOn,
  Home,
  Science,
  Business,
  Star,
  StarBorder,
  Schedule,
  MyLocation,
  Navigation,
  Announcement,
  Event,
} from '@mui/icons-material';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';

// Use the Mapbox token from environment variables
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || '';

// Campus center coordinates (MIT World Peace Dome)
const CAMPUS_CENTER = {
  latitude: 18.492605418784578,
  longitude: 74.02563567382958,
  zoom: 16.5,
  bearing: 0,
  pitch: 0
};

// Map styles
const MAP_STYLES = [
  { id: 'streets-v12', name: 'Streets' },
  { id: 'satellite-v9', name: 'Satellite' },
  { id: 'light-v11', name: 'Light' },
  { id: 'dark-v11', name: 'Dark' },
  { id: 'outdoors-v12', name: 'Outdoors' },
];

interface Location {
  id: string;
  name: string;
  type: string;
  coordinates: [number, number];
  description: string;
  icon: React.ReactNode;
  details: {
    contact: {
      phone: string;
      email: string;
      website?: string;
    };
    timings: string;
    facilities: string[];
    images?: string[];
    rating?: number;
    reviews?: number;
    capacity?: number;
    accessibility?: string[];
    events?: {
      name: string;
      date: string;
      description: string;
    }[];
    staff?: {
      name: string;
      role: string;
      contact: string;
    }[];
  };
}

// Enhanced locations data for MIT ADT University
const locations: Location[] = [
  {
    id: 'world-peace-dome',
    name: 'MIT World Peace Dome',
    type: 'landmark',
    coordinates: [74.02563567382958, 18.492605418784578],
    description: 'The World Peace Dome at MIT ADT University - A symbol of harmony and global unity',
    icon: <School />,
    details: {
      contact: {
        phone: '+91-20-3027-4000',
        email: 'info@mituniversity.edu.in',
        website: 'www.mituniversity.edu.in'
      },
      timings: '9:00 AM - 6:00 PM',
      facilities: [
        'Exhibition Space',
        'Conference Hall',
        'Meditation Area',
        'Peace Library',
        'Cultural Center'
      ],
      rating: 4.8,
      reviews: 150,
      capacity: 1000
    }
  }
];

// Update location types with more categories
const LOCATION_TYPES = [
  { type: 'academic', label: 'Academic Buildings', icon: <School />, color: '#1976d2' },
  { type: 'library', label: 'Library', icon: <LocalLibrary />, color: '#2196f3' },
  { type: 'sports', label: 'Sports Facilities', icon: <SportsSoccer />, color: '#4caf50' },
  { type: 'food', label: 'Food & Dining', icon: <Restaurant />, color: '#ff9800' },
  { type: 'hostel', label: 'Hostels', icon: <Home />, color: '#795548' },
  { type: 'medical', label: 'Medical Center', icon: <LocalHospital />, color: '#f44336' },
  { type: 'parking', label: 'Parking Areas', icon: <LocalParking />, color: '#607d8b' },
  { type: 'landmark', label: 'Landmarks', icon: <LocationOn />, color: '#9c27b0' },
  { type: 'lab', label: 'Laboratories', icon: <Science />, color: '#00bcd4' },
  { type: 'admin', label: 'Administrative', icon: <Business />, color: '#3f51b5' }
];

interface RouteInfo {
  from: Location;
  to: Location;
  distance: string;
  duration: string;
  steps: string[];
}

interface ViewState {
  latitude: number;
  longitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
  padding: { top: number; bottom: number; left: number; right: number };
}

interface TravelMode {
  id: string;
  label: string;
  icon: React.ReactElement;
  speed: number; // km/h
}

const TRAVEL_MODES: TravelMode[] = [
  { id: 'walking', label: 'Walking', icon: <DirectionsWalk />, speed: 4 },
  { id: 'cycling', label: 'Cycling', icon: <DirectionsBike />, speed: 12 },
  { id: 'driving', label: 'Driving', icon: <DirectionsCar />, speed: 30 }
];

const CampusMap: React.FC = () => {
  const [viewState, setViewState] = useState(CAMPUS_CENTER);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [mapStyle, setMapStyle] = useState('streets-v12');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [routeStart, setRouteStart] = useState<Location | null>(null);
  const [routeEnd, setRouteEnd] = useState<Location | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<string[]>(
    LOCATION_TYPES.map(type => type.type)
  );
  const [legendExpanded, setLegendExpanded] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('walking');
  const [favoriteRoutes, setFavoriteRoutes] = useState<Array<{start: Location; end: Location}>>([]);
  const [estimatedArrival, setEstimatedArrival] = useState<string>('');
  const [loadingType, setLoadingType] = useState<string | null>(null);

  // Filter locations based on search and type
  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || location.type === selectedType;
    const isVisible = visibleTypes.includes(location.type);
    return matchesSearch && matchesType && isVisible;
  });

  // Handle type filter with correct type
  const handleTypeChange = (event: SelectChangeEvent<string>) => {
    setSelectedType(event.target.value);
  };

  // Handle map move with correct type
  const handleMapMove = useCallback((evt: ViewStateChangeEvent) => {
    setViewState(evt.viewState);
  }, []);

  // Handle marker click with correct type
  const handleMarkerClick = useCallback((e: MapLayerMouseEvent, location: Location) => {
    e.originalEvent.stopPropagation();
    setSelectedLocation(location);
  }, []);

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Handle map style change
  const handleStyleChange = useCallback((event: React.MouseEvent<HTMLElement>, newStyle: string | null) => {
    if (newStyle !== null) {
      setMapStyle(newStyle);
    }
  }, []);

  // Calculate route between locations
  const calculateRoute = async (start: Location, end: Location) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/walking/${start.coordinates.join(',')};${end.coordinates.join(',')}?geometries=geojson&access_token=${MAPBOX_TOKEN}`
      );
      const data = await response.json();
      
      if (data.routes && data.routes[0]) {
        const route = data.routes[0];
        setRoute({
          from: start,
          to: end,
          distance: (route.distance / 1000).toFixed(2) + ' km',
          duration: Math.round(route.duration / 60) + ' minutes',
          steps: route.legs[0].steps.map((step: any) => step.maneuver.instruction)
        });
      }
    } catch (err) {
      setError('Failed to calculate route. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Add this after other handlers
  const handleTypeToggle = (type: string) => {
    setVisibleTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  // Reset view to center on dome
  const resetView = useCallback(() => {
    setViewState(CAMPUS_CENTER);
  }, []);

  // Add effect to reset view on component mount
  React.useEffect(() => {
    resetView();
  }, [resetView]);

  // Update the filterLocationsByType function
  const filterLocationsByType = async (type: string) => {
    setLoadingType(type);
    const filtered = locations.filter(loc => loc.type === type);
    if (filtered.length > 0) {
      const firstLocation = filtered[0];
      setSelectedLocation(firstLocation);
      setViewState({
        ...viewState,
        longitude: firstLocation.coordinates[0],
        latitude: firstLocation.coordinates[1],
        zoom: 18
      });
      setSelectedType(type);
    }
    // Simulate a small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 300));
    setLoadingType(null);
  };

  // Add common button styles
  const quickActionButtonStyle = (type: string) => ({
    borderColor: selectedType === type ? 'primary.main' : '#e2e8f0',
    color: selectedType === type ? 'primary.main' : '#64748b',
    bgcolor: selectedType === type ? 'primary.main + 10' : 'transparent',
    textTransform: 'none',
    p: 1,
    justifyContent: 'flex-start',
    '&:hover': {
      borderColor: 'primary.main',
      bgcolor: '#f8fafc'
    },
    '&.Mui-disabled': {
      borderColor: '#e2e8f0',
      color: '#94a3b8'
    }
  });

  // Add this near other handlers
  const handleMapClick = useCallback((e: MapLayerMouseEvent) => {
    setSelectedLocation(null);
  }, []);

  return (
    <Box 
        sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: '#f8fafc',
        overflow: 'hidden',
        display: 'flex',
        gap: 0
      }}
    >
      {/* Left Navigation Panel */}
      <Paper
        elevation={0}
        sx={{
          width: '280px',
          height: '100%',
          bgcolor: '#ffffff',
          borderRight: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          p: 2,
          zIndex: 1200,
          position: 'relative',
          flexShrink: 0
        }}
      >
        {/* Logo and Title */}
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          mb: 3,
          pl: 1
        }}>
          <LocationOn sx={{ color: 'primary.main', fontSize: 28 }} />
          <Typography variant="h6" sx={{ 
            color: '#1e293b',
            fontWeight: 600,
            fontSize: '1.25rem'
          }}>
            Campus Map
          </Typography>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search locations..."
          value={searchQuery}
          onChange={handleSearch}
          size="small"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: '#64748b', fontSize: 20 }} />
              </InputAdornment>
            ),
          }}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              bgcolor: '#f1f5f9',
              borderRadius: '12px',
              '& fieldset': {
                borderColor: 'transparent'
              },
              '&:hover fieldset': {
                borderColor: 'transparent'
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main'
              }
            }
          }}
        />

        {/* Quick Filters */}
        <Box sx={{ mb: 2, px: 1 }}>
          <Typography variant="subtitle2" sx={{ 
            color: '#475569',
            fontWeight: 600,
            mb: 1.5
          }}>
            Quick Filters
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
            {LOCATION_TYPES.map(({ type, label, color, icon }) => (
                  <Chip 
                key={type}
                label={label}
                icon={React.cloneElement(icon as React.ReactElement, {
                  sx: { fontSize: 18 }
                })}
                onClick={() => handleTypeToggle(type)}
                    sx={{
                  bgcolor: visibleTypes.includes(type) ? `${color}15` : 'transparent',
                  border: 1,
                  borderColor: visibleTypes.includes(type) ? color : '#e2e8f0',
                  color: visibleTypes.includes(type) ? color : '#64748b',
                  '&:hover': {
                    bgcolor: `${color}15`,
                  },
                  '& .MuiChip-icon': {
                    color: 'inherit'
                  }
                    }}
                  />
                ))}
          </Stack>
              </Box>

        {/* Location List */}
        <Box sx={{ 
          flex: 1,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px'
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#cbd5e1',
            borderRadius: '4px'
          }
        }}>
          {filteredLocations.map(location => (
            <Paper
              key={location.id}
              elevation={0}
            sx={{
                p: 2,
                mb: 1,
                borderRadius: '12px',
                bgcolor: selectedLocation?.id === location.id ? '#f1f5f9' : 'transparent',
                cursor: 'pointer',
              '&:hover': {
                  bgcolor: '#f1f5f9'
                }
              }}
              onClick={() => {
                setSelectedLocation(location);
                setViewState({
                  ...viewState,
                  latitude: location.coordinates[1],
                  longitude: location.coordinates[0],
                  zoom: 18
                });
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '10px',
                    bgcolor: LOCATION_TYPES.find(t => t.type === location.type)?.color + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {React.cloneElement(location.icon as React.ReactElement, {
                      sx: { color: LOCATION_TYPES.find(t => t.type === location.type)?.color }
                    })}
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ 
                      color: '#1e293b',
                      fontWeight: 600,
                      fontSize: '0.875rem'
                    }}>
                      {location.name}
                    </Typography>
                    <Typography variant="body2" sx={{ 
                      color: '#64748b',
                      fontSize: '0.75rem'
                    }}>
                      {LOCATION_TYPES.find(t => t.type === location.type)?.label}
                    </Typography>
                  </Box>
                </Box>
                <IconButton 
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDetails(true);
                  }}
                >
                  <Info sx={{ fontSize: 20, color: '#64748b' }} />
                </IconButton>
              </Box>
            </Paper>
          ))}
        </Box>

        {/* Map Style Toggle */}
        <Box sx={{ mt: 2, p: 1 }}>
          <Typography variant="subtitle2" sx={{ 
            color: '#475569',
            fontWeight: 600,
            mb: 1.5,
            pl: 1
          }}>
            Map Style
          </Typography>
          <ToggleButtonGroup
            value={mapStyle}
            exclusive
            onChange={handleStyleChange}
            size="small"
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 1,
              '& .MuiToggleButton-root': {
                flex: '1 0 calc(50% - 4px)',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                color: '#64748b',
                textTransform: 'none',
                py: 0.75,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: 'white',
              '&:hover': {
                    bgcolor: 'primary.dark'
                  }
                }
              }
            }}
          >
            {MAP_STYLES.map(style => (
              <ToggleButton key={style.id} value={style.id}>
                {style.name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </Box>
      </Paper>

      {/* Main Map Container */}
      <Box sx={{ 
        flex: 1,
        position: 'relative',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <ReactMapGL
          {...viewState}
          onMove={evt => setViewState(evt.viewState)}
          onClick={handleMapClick}
          style={{ width: '100%', height: '100%' }}
          mapStyle={`mapbox://styles/mapbox/${mapStyle}`}
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={true}
        >
          {/* Map Controls */}
          <Box sx={{ 
            position: 'absolute', 
            top: '20px', 
            right: '340px',
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1,
            zIndex: 1,
            '& > div': {
              bgcolor: 'white',
              borderRadius: '8px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
              }
            }
          }}>
            <GeolocateControl position="top-right" />
            <FullscreenControl position="top-right" />
            <NavigationControl position="top-right" showCompass showZoom />
          </Box>

          {/* Markers */}
          {filteredLocations.map(location => (
            <Marker
              key={location.id}
              longitude={location.coordinates[0]}
              latitude={location.coordinates[1]}
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedLocation(selectedLocation?.id === location.id ? null : location);
              }}
              anchor="bottom"
            >
              <Box
        sx={{ 
          position: 'relative',
                  cursor: 'pointer',
                  zIndex: selectedLocation?.id === location.id ? 2 : 1,
                  '&:hover': {
                    zIndex: 2,
                    '& .marker-label': {
                      opacity: 1,
                      transform: 'translateX(-50%) translateY(-8px)',
                    },
                    '& .marker-icon': {
                      transform: 'scale(1.05)',
                      borderWidth: '2.5px'
                    },
                    '& .marker-dot': {
                      transform: 'translate(-50%, -50%) scale(0.6)',
                    }
                  }
                }}
              >
                {/* Marker Label */}
                <Box
                  className="marker-label"
                  sx={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    bgcolor: 'white',
                    color: '#1e293b',
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    whiteSpace: 'nowrap',
                    opacity: 0,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    zIndex: 1,
                    willChange: 'transform, opacity',
                    transformOrigin: 'bottom center',
                    border: '1px solid #e2e8f0',
          '&::after': {
            content: '""',
            position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      border: '6px solid transparent',
                      borderTopColor: 'white'
                    }
                  }}
                >
                  {location.name}
                </Box>

                {/* Marker Icon */}
                <Box
                  className="marker-icon"
                  sx={{
                    width: 40,
                    height: 40,
                    bgcolor: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid',
                    borderColor: LOCATION_TYPES.find(t => t.type === location.type)?.color || 'primary.main',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    zIndex: 2,
                    willChange: 'transform',
                    transformOrigin: 'center bottom',
                    '&:hover': {
                      transform: 'scale(1.05)',
                      borderWidth: '2.5px'
                    }
                  }}
                >
                  {React.cloneElement(location.icon as React.ReactElement, {
                    sx: { 
                      fontSize: 22,
                      color: LOCATION_TYPES.find(t => t.type === location.type)?.color,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }
                  })}
                </Box>

                {/* Marker Dot/Pulse Effect */}
                <Box
                  className="marker-dot"
          sx={{
            position: 'absolute',
            top: '50%',
                    left: '50%',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    bgcolor: LOCATION_TYPES.find(t => t.type === location.type)?.color + '08',
                    transform: 'translate(-50%, -50%) scale(0.6)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 1,
                    willChange: 'transform, opacity',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      width: '100%',
                      height: '100%',
                      borderRadius: '50%',
                      bgcolor: 'inherit',
                      animation: 'pulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
                      transform: 'translate(-50%, -50%)'
                    }
                  }}
                />

                {/* Quick Info Tooltip */}
                {selectedLocation?.id === location.id && (
                  <Grow 
                    in={selectedLocation?.id === location.id} 
                    timeout={{
                      enter: 400,
                      exit: 300
                    }}
                    unmountOnExit
                  >
                    <Paper
                      elevation={3}
                      onClick={(e) => e.stopPropagation()}
                      sx={{
                        position: 'absolute',
                        bottom: '120%',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: 320,
                        borderRadius: '16px',
                        overflow: 'hidden',
                        zIndex: 3,
                        willChange: 'transform, opacity',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        bgcolor: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(8px)',
                        transformOrigin: 'bottom center',
                        '&.MuiGrow-exit': {
                          opacity: 0,
                          transform: 'translateX(-50%) scale(0.95)',
                        }
                      }}
                    >
                      <Box sx={{ 
                        p: 2.5,
                        borderBottom: '1px solid rgba(0,0,0,0.06)'
                      }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            mb: 1, 
                            fontWeight: 600,
                            color: '#1e293b',
                            fontSize: '1rem',
                            lineHeight: 1.4
                          }}
                        >
                          {location.name}
                        </Typography>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            color: '#64748b',
                            mb: 2,
                            lineHeight: 1.6,
                            fontSize: '0.875rem'
                          }}
                        >
                          {location.description.slice(0, 120)}...
                        </Typography>
                        
                        {location.details.timings && (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1.5, 
                            mb: 2,
                            py: 1,
                            px: 1.5,
                            bgcolor: '#f8fafc',
                            borderRadius: '8px'
                          }}>
                            <AccessTime sx={{ fontSize: 20, color: '#0ea5e9' }} />
                            <Box>
                              <Typography 
                                variant="caption" 
                                sx={{ 
                                  color: '#475569',
                                  display: 'block',
                                  fontWeight: 500,
                                  mb: 0.25
                                }}
                              >
                                Opening Hours
                              </Typography>
                              <Typography 
                                variant="body2" 
                                sx={{ 
                                  color: '#0f172a',
                                  fontWeight: 500
                                }}
                              >
                                {location.details.timings}
                              </Typography>
                            </Box>
                          </Box>
                        )}

                        {location.details.rating && (
                          <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 1,
                            mb: 1
                          }}>
                            <Rating 
                              value={location.details.rating} 
                              readOnly 
            size="small"
                              sx={{
                                '& .MuiRating-iconFilled': {
                                  color: '#f59e0b'
                                }
                              }}
                            />
                            <Typography 
                              variant="caption" 
            sx={{
                                color: '#64748b',
                                fontWeight: 500
                              }}
                            >
                              {location.details.rating} ({location.details.reviews} reviews)
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      <Box 
                        sx={{ 
                          bgcolor: '#f8fafc',
                          p: 1.5,
                          display: 'flex',
                          gap: 1
                        }}
                      >
                        <Button
                          size="medium"
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDetails(true);
                          }}
                          sx={{
                            flex: 1,
                            textTransform: 'none',
                            borderColor: '#e2e8f0',
                            color: '#475569',
                            fontWeight: 500,
              '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: '#fff'
                            }
                          }}
                        >
                          More Details
          </Button>
          <Button
                          size="medium"
            variant="contained"
                          onClick={(e) => {
                            e.stopPropagation();
                            setRouteEnd(location);
                            if (routeStart) {
                              calculateRoute(routeStart, location);
                            }
                          }}
            sx={{
                            flex: 1,
                            textTransform: 'none',
                            fontWeight: 500,
              boxShadow: 'none',
              '&:hover': {
                              boxShadow: 'none',
                              bgcolor: 'primary.dark'
                            }
                          }}
                        >
                          Get Directions
          </Button>
                      </Box>
                    </Paper>
                  </Grow>
                )}
              </Box>
            </Marker>
          ))}
        </ReactMapGL>
      </Box>

      {/* Right Essential Features Panel */}
      <Paper
        elevation={0}
          sx={{
          width: '320px',
            height: '100%',
          bgcolor: '#ffffff',
          borderLeft: '1px solid #e5e7eb',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          flexShrink: 0,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px'
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: 'transparent'
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#cbd5e1',
            borderRadius: '4px'
          }
        }}
      >
        {/* Search Section */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb' }}>
          <Typography variant="h6" sx={{ 
            color: '#1e293b',
            fontWeight: 600,
            fontSize: '1.25rem',
            mb: 2
          }}>
            Campus Explorer
          </Typography>
          <TextField
            fullWidth
            placeholder="Search places, facilities..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#64748b' }} />
                </InputAdornment>
              ),
              sx: {
                bgcolor: '#f8fafc',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#e2e8f0'
                }
              }
            }}
          />
        </Box>

        {/* Quick Actions */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb' }}>
          <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1.5, fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={loadingType === 'library' ? <CircularProgress size={16} /> : <LocalLibrary />}
                onClick={() => filterLocationsByType('library')}
                disabled={loadingType !== null}
                sx={quickActionButtonStyle('library')}
              >
                Library
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={loadingType === 'food' ? <CircularProgress size={16} /> : <Restaurant />}
                onClick={() => filterLocationsByType('food')}
                disabled={loadingType !== null}
                sx={quickActionButtonStyle('food')}
              >
                Cafeteria
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={loadingType === 'sports' ? <CircularProgress size={16} /> : <SportsSoccer />}
                onClick={() => filterLocationsByType('sports')}
                disabled={loadingType !== null}
                sx={quickActionButtonStyle('sports')}
              >
                Sports
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={loadingType === 'parking' ? <CircularProgress size={16} /> : <LocalParking />}
                onClick={() => filterLocationsByType('parking')}
                disabled={loadingType !== null}
                sx={quickActionButtonStyle('parking')}
              >
                Parking
              </Button>
            </Grid>
          </Grid>
        </Box>

        {/* Add feedback when no locations found */}
        {selectedType !== 'all' && filteredLocations.length === 0 && (
          <Alert 
            severity="info" 
            sx={{
              mx: 2, 
              mt: 2,
              borderRadius: '8px',
              '& .MuiAlert-message': { 
                color: '#3b82f6' 
              }
            }}
          >
            No {selectedType} locations found
          </Alert>
        )}

        {/* Important Updates */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb' }}>
          <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1.5, fontWeight: 600 }}>
            Important Updates
          </Typography>
          <List sx={{ p: 0 }}>
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Announcement sx={{ color: 'warning.main', fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary="Library Extended Hours"
                secondary="Open until 11 PM during exams"
            sx={{
                  '& .MuiTypography-root': { fontSize: '0.875rem' },
                  '& .MuiTypography-secondary': { color: '#64748b', fontSize: '0.75rem' }
                }}
              />
            </ListItem>
            <ListItem sx={{ px: 0, py: 1 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Event sx={{ color: 'primary.main', fontSize: 20 }} />
              </ListItemIcon>
              <ListItemText 
                primary="Campus Event Today"
                secondary="Tech Fest in Main Auditorium"
                sx={{
                  '& .MuiTypography-root': { fontSize: '0.875rem' },
                  '& .MuiTypography-secondary': { color: '#64748b', fontSize: '0.75rem' }
                }}
              />
            </ListItem>
          </List>
        </Box>

        {/* Nearby Facilities */}
        <Box sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1.5, fontWeight: 600 }}>
            Nearby Facilities
          </Typography>
          <List sx={{ p: 0 }}>
            {filteredLocations.slice(0, 5).map((location) => (
              <ListItem 
                key={location.id}
                button
                onClick={() => {
                  setSelectedLocation(location);
                  setViewState({
                    ...viewState,
                    longitude: location.coordinates[0],
                    latitude: location.coordinates[1],
                    zoom: 18
                  });
                }}
                sx={{
                  px: 1,
                  py: 1,
                  borderRadius: '8px',
                  mb: 0.5,
                  '&:hover': {
                    bgcolor: '#f8fafc'
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  {React.cloneElement(location.icon as React.ReactElement, {
                    sx: { 
                      fontSize: 20,
                      color: LOCATION_TYPES.find(t => t.type === location.type)?.color
                    }
                  })}
                </ListItemIcon>
                <ListItemText 
                  primary={location.name}
                  secondary={location.type}
              sx={{ 
                    '& .MuiTypography-root': { fontSize: '0.875rem' },
                    '& .MuiTypography-secondary': { color: '#64748b', fontSize: '0.75rem' }
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Box>
      </Paper>

      {/* Location Details Dialog */}
      <Dialog
        open={showDetails}
        onClose={() => setShowDetails(false)}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: 2,
            maxHeight: 'calc(100vh - 64px)',
            borderRadius: '16px',
            overflow: 'hidden'
          },
          '& .MuiDialogTitle-root': {
            py: 2,
            px: 3,
            borderBottom: '1px solid #e5e7eb'
          },
          '& .MuiDialogContent-root': {
            p: 3,
            '&::-webkit-scrollbar': {
              width: '4px'
            },
            '&::-webkit-scrollbar-track': {
              bgcolor: 'transparent'
            },
            '&::-webkit-scrollbar-thumb': {
              bgcolor: '#cbd5e1',
              borderRadius: '4px'
            }
          },
          '& .MuiDialogActions-root': {
            px: 3,
            py: 2,
            borderTop: '1px solid #e5e7eb'
          }
        }}
      >
        {selectedLocation && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {selectedLocation.icon}
                  <Typography variant="h6">
                    {selectedLocation.name}
                  </Typography>
          </Box>
                <IconButton onClick={() => setShowDetails(false)}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  <Typography color="text.secondary" paragraph>
                    {selectedLocation.description}
                  </Typography>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Contact Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon><Phone /></ListItemIcon>
                        <ListItemText primary={selectedLocation.details.contact.phone} />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon><Email /></ListItemIcon>
                        <ListItemText primary={selectedLocation.details.contact.email} />
                      </ListItem>
                      {selectedLocation.details.contact.website && (
                        <ListItem>
                          <ListItemIcon><Web /></ListItemIcon>
                          <ListItemText primary={selectedLocation.details.contact.website} />
                        </ListItem>
                      )}
                    </List>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Facilities & Amenities
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {selectedLocation.details.facilities.map((facility, index) => (
                        <Chip
                          key={index}
                          label={facility}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                    </Stack>
                  </Box>

                  {selectedLocation.details.accessibility && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Accessibility
                      </Typography>
                      <List dense>
                        {selectedLocation.details.accessibility.map((item, index) => (
                          <ListItem key={index}>
                            <ListItemText primary={item} />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {selectedLocation.details.events && selectedLocation.details.events.length > 0 && (
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Upcoming Events
                      </Typography>
                      <List dense>
                        {selectedLocation.details.events.map((event, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={event.name}
                              secondary={`${event.date} - ${event.description}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={4}>
                  <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Operating Hours
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <AccessTime sx={{ mr: 1, fontSize: 20 }} />
                      <Typography variant="body2">
                        {selectedLocation.details.timings}
                      </Typography>
                    </Box>
                    {selectedLocation.details.capacity && (
                      <Typography variant="body2" color="text.secondary">
                        Capacity: {selectedLocation.details.capacity} people
                      </Typography>
        )}
      </Paper>

                  {selectedLocation.details.staff && (
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        Key Staff
                      </Typography>
                      <List dense>
                        {selectedLocation.details.staff.map((person, index) => (
                          <ListItem key={index}>
                            <ListItemText
                              primary={person.name}
                              secondary={`${person.role} - ${person.contact}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setShowDetails(false)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Update the pulse animation keyframes */}
      <style>
        {`
          @keyframes pulse {
            0% {
              transform: translate(-50%, -50%) scale(0.9);
              opacity: 0.25;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.1);
              opacity: 0.12;
            }
            100% {
              transform: translate(-50%, -50%) scale(1.3);
              opacity: 0;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default CampusMap; 