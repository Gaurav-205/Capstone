import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactMapGL, { 
  Marker, 
  Popup, 
  NavigationControl, 
  FullscreenControl, 
  GeolocateControl,
  MapLayerMouseEvent,
  ViewStateChangeEvent,
  Source,
  Layer,
  MapRef
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
  DialogContentText,
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
  CheckCircle,
  Cancel,
  TheaterComedy,
  Museum,
  Church,
  SportsTennis,
  AccountBalance,
  History,
  AdminPanelSettings,
  LocalCafe,
  Park,
} from '@mui/icons-material';
import { Theme } from '@mui/material/styles';
import { SxProps } from '@mui/system';
import { Location as MapLocation, ViewState as MapViewState, RouteInfo as MapRouteInfo, TravelMode as MapTravelMode } from '../types/map';
import {
  clusterMarkers,
  filterVisibleMarkers,
  memoizeMarkerData,
  monitorMarkerPerformance,
  lazyLoadMarkerDetails
} from '../utils/markerOptimization';
import mapboxgl from 'mapbox-gl';

// Use the Mapbox token from environment variables
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || '';

// Campus center coordinates (MIT World Peace Dome)
const CAMPUS_CENTER: MapViewState = {
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

// Enhanced locations data for MIT ADT University
const locations: MapLocation[] = [];

// Update location types with more categories
const LOCATION_TYPES = [
  { type: 'academic', label: 'Academic Buildings', icon: <School />, color: '#4A148C' }, // deep-purple-900
  { type: 'library', label: 'Library', icon: <LocalLibrary />, color: '#6A1B9A' }, // purple-900
  { type: 'sports', label: 'Sports Facilities', icon: <SportsSoccer />, color: '#880E4F' }, // pink-900
  { type: 'food', label: 'Food & Dining', icon: <Restaurant />, color: '#C2185B' }, // pink-700
  { type: 'hostel', label: 'Hostels', icon: <Home />, color: '#AD1457' }, // pink-800
  { type: 'medical', label: 'Medical Center', icon: <LocalHospital />, color: '#D81B60' }, // pink-600
  { type: 'parking', label: 'Parking Areas', icon: <LocalParking />, color: '#E91E63' }, // pink-500
  { type: 'landmark', label: 'Landmarks', icon: <LocationOn />, color: '#5E35B1' }, // deep-purple-600
  { type: 'lab', label: 'Laboratories', icon: <Science />, color: '#673AB7' }, // deep-purple-500
  { type: 'admin', label: 'Administrative', icon: <Business />, color: '#7E57C2' } // deep-purple-400
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
}

interface TravelMode {
  id: string;
  label: string;
  icon: React.ReactElement;
  speed: number; // km/h
}

const CampusMap: React.FC = () => {
  const [viewState, setViewState] = useState<MapViewState>(CAMPUS_CENTER);
  const [selectedLocation, setSelectedLocation] = useState<MapLocation | null>(null);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [mapStyle, setMapStyle] = useState('streets-v12');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [route, setRoute] = useState<MapRouteInfo | null>(null);
  const [routeStart, setRouteStart] = useState<MapLocation | null>(null);
  const [routeEnd, setRouteEnd] = useState<MapLocation | null>(null);
  const [visibleTypes, setVisibleTypes] = useState<string[]>(
    LOCATION_TYPES.map(type => type.type)
  );
  const [legendExpanded, setLegendExpanded] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);
  const [selectedMode, setSelectedMode] = useState<string>('walking');
  const [favoriteRoutes, setFavoriteRoutes] = useState<Array<{start: MapLocation; end: MapLocation}>>([]);
  const [estimatedArrival, setEstimatedArrival] = useState<string>('');
  const [loadingType, setLoadingType] = useState<string | null>(null);
  const [markerCache] = useState(() => memoizeMarkerData(locations));
  const mapRef = useRef<MapRef>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout>();
  const performanceMonitorRef = useRef<{ end: () => number }>();

  // Memoize static data inside component
  const memoizedMapStyles = useMemo(() => MAP_STYLES, []);
  
  const memoizedTravelModes = useMemo(() => [
    { id: 'walk', label: 'Walk', icon: <DirectionsWalk />, speed: 5 },
    { id: 'bike', label: 'Bike', icon: <DirectionsBike />, speed: 15 },
    { id: 'car', label: 'Car', icon: <DirectionsCar />, speed: 40 },
  ], []);

  // Memoize route layer
  const routeLayer = useMemo(() => ({
    id: 'route',
    type: 'line',
    layout: {
      'line-join': 'round',
      'line-cap': 'round',
    },
    paint: {
      'line-color': '#3884ff',
      'line-width': 4,
    },
  }), []);

  // Filter locations based on search and type
  const filteredLocations = useMemo(() => {
    return locations.filter(location => {
      const matchesSearch = location.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'all' || location.type === selectedType;
      return matchesSearch && matchesType;
  });
  }, [locations, searchQuery, selectedType]);

  // Handle type filter with correct type
  const handleTypeChange = useCallback((event: SelectChangeEvent<string>) => {
    setSelectedType(event.target.value);
  }, []);

  // Handle map move with correct type
  const handleMapMove = useCallback((evt: ViewStateChangeEvent) => {
    const { latitude, longitude, zoom, bearing, pitch } = evt.viewState;
    setViewState({ latitude, longitude, zoom, bearing, pitch });
  }, []);

  // Optimized marker rendering
  const visibleMarkers = useMemo(() => {
    if (!mapRef.current) return [];

    try {
      const map = mapRef.current.getMap();
      const viewport = {
        north: viewState.latitude + 0.02,
        south: viewState.latitude - 0.02,
        east: viewState.longitude + 0.02,
        west: viewState.longitude - 0.02
      };
      
      // Start performance monitoring
      performanceMonitorRef.current = monitorMarkerPerformance(locations.length);
      
      // Filter and cluster markers
      const filtered = filterVisibleMarkers(locations, viewport, viewState.zoom);
      const clustered = clusterMarkers(filtered, viewport, viewState.zoom);
      
      return clustered;
    } catch (error) {
      console.error('Error getting map bounds:', error);
      return [];
    }
  }, [locations, viewState.zoom, viewState.latitude, viewState.longitude]);

  // Debounced viewport update
  const handleViewStateChange = useCallback((event: ViewStateChangeEvent) => {
    setViewState(event.viewState);
    
    // Clear existing timeout
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // Set new timeout for marker update
    updateTimeoutRef.current = setTimeout(() => {
      // End performance monitoring
      if (performanceMonitorRef.current) {
        performanceMonitorRef.current.end();
      }
    }, 100);
  }, []);

  // Lazy load marker details
  const handleMarkerClick = useCallback(async (marker: MapLocation) => {
    if (!marker.details) {
      const updatedMarker = await lazyLoadMarkerDetails(marker);
      markerCache.set(updatedMarker.id, updatedMarker);
    }
    setSelectedLocation(marker);
    setShowDetails(true);
  }, [markerCache]);

  // Handle search
  const handleSearch = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  }, []);

  // Handle map style change
  const handleStyleChange = useCallback((event: React.MouseEvent<HTMLElement>, newStyle: string | null) => {
    if (newStyle !== null) {
      setMapStyle(newStyle);
    }
  }, []);

  // Calculate route between locations
  const calculateRoute = async (start: MapLocation, end: MapLocation) => {
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
  useEffect(() => {
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
  const handleMapClick = useCallback(() => {
    setSelectedLocation(null);
  }, []);

  // Handle show details with correct event type
  const handleShowDetails = (location: MapLocation, e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedLocation(location);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setShowDetails(false);
  };

  // Add passive scroll listener
  useEffect(() => {
    const options = { passive: true };
    const handleScroll = () => {
      // Scroll handling logic
    };

    window.addEventListener('scroll', handleScroll, options);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
      markerCache.clear();
    };
  }, [markerCache]);

  return (
    <Box 
        sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bgcolor: '#F3E5F5', // purple-50
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
          borderRight: '1px solid #E1BEE7', // purple-100
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
          <LocationOn sx={{ color: '#4A148C', fontSize: 28 }} /> {/* deep-purple-900 */}
          <Typography variant="h6" sx={{ 
            color: '#4A148C', // deep-purple-900
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
                <Search sx={{ color: '#7E57C2' }} /> {/* deep-purple-400 */}
              </InputAdornment>
            ),
          }}
          sx={{ 
            mb: 2,
            '& .MuiOutlinedInput-root': {
              bgcolor: '#F3E5F5', // purple-50
              borderRadius: '12px',
              '& fieldset': {
                borderColor: '#E1BEE7' // purple-100
              },
              '&:hover fieldset': {
                borderColor: '#CE93D8' // purple-200
              },
              '&.Mui-focused fieldset': {
                borderColor: '#4A148C' // deep-purple-900
              }
            }
          }}
        />

        {/* Quick Filters */}
        <Box sx={{ mb: 2, px: 1 }}>
          <Typography variant="subtitle2" sx={{ 
            color: '#4A148C', // deep-purple-900
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
                    handleShowDetails(location, e);
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
            {memoizedMapStyles.map(style => (
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
          ref={mapRef}
          {...viewState}
          onMove={handleViewStateChange}
          onClick={handleMapClick}
          style={{ width: '100%', height: '100%' }}
          mapStyle={`mapbox://styles/mapbox/${mapStyle}`}
          mapboxAccessToken={MAPBOX_TOKEN}
          attributionControl={true}
          reuseMaps
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
              boxShadow: '0 2px 8px rgba(74, 20, 140, 0.1)', // deep-purple-900 with opacity
              '&:hover': {
                boxShadow: '0 4px 12px rgba(74, 20, 140, 0.15)' // deep-purple-900 with opacity
              }
            }
          }}>
            <GeolocateControl position="top-right" />
            <FullscreenControl position="top-right" />
            <NavigationControl position="top-right" showCompass showZoom />
          </Box>

          {/* Markers */}
          {visibleMarkers.map(marker => (
            <Marker
              key={marker.id}
              longitude={marker.coordinates[0]}
              latitude={marker.coordinates[1]}
              onClick={() => handleMarkerClick(marker)}
            >
              <Box
        sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  width: marker.isCluster ? 40 : 30,
                  height: marker.isCluster ? 40 : 30,
                  backgroundColor: marker.isCluster ? 'primary.main' : 'white',
                  borderRadius: '50%',
                  boxShadow: 2,
                  cursor: 'pointer',
                    '&:hover': {
                    transform: 'scale(1.1)',
                    transition: 'transform 0.2s',
                  },
                }}
              >
                {marker.isCluster ? (
                  <Typography variant="caption" color="white">
                    {marker.clusterSize}
                        </Typography>
                ) : (
                  marker.icon
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
          borderLeft: '1px solid #E1BEE7', // purple-100
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          flexShrink: 0,
          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '4px'
          },
          '&::-webkit-scrollbar-track': {
            bgcolor: '#F3E5F5' // purple-50
          },
          '&::-webkit-scrollbar-thumb': {
            bgcolor: '#B39DDB', // deep-purple-200
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
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        sx={{
          '& .MuiDialog-paper': {
            margin: 2,
            maxHeight: 'calc(100vh - 64px)',
            borderRadius: '16px',
            overflow: 'hidden',
            bgcolor: '#ffffff',
            boxShadow: '0 4px 20px rgba(74, 20, 140, 0.15)' // deep-purple-900 with opacity
          }
        }}
      >
        {selectedLocation && (
          <>
            <DialogTitle 
              sx={{ 
                p: 3,
                borderBottom: '1px solid #e5e7eb'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{
                    width: 48,
                    height: 48,
                    borderRadius: '12px',
                    bgcolor: LOCATION_TYPES.find(t => t.type === selectedLocation.type)?.color + '15',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {React.cloneElement(selectedLocation.icon as React.ReactElement, {
                      sx: { 
                        fontSize: 24,
                        color: LOCATION_TYPES.find(t => t.type === selectedLocation.type)?.color 
                      }
                    })}
                  </Box>
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e293b' }}>
                    {selectedLocation.name}
                  </Typography>
                    <Typography variant="subtitle2" sx={{ color: '#64748b' }}>
                      {LOCATION_TYPES.find(t => t.type === selectedLocation.type)?.label}
                  </Typography>
          </Box>
                </Box>
                <IconButton onClick={handleCloseDetails}>
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={8}>
                  {/* Main Content */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body1" sx={{ color: '#475569', lineHeight: 1.6 }}>
                    {selectedLocation.description}
                  </Typography>
                  </Box>

                  {/* Contact Information */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                      Contact Information
                    </Typography>
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          <LocationOn />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Address"
                          secondary={selectedLocation.address}
                          sx={{ '& .MuiTypography-root': { color: '#475569' } }}
                        />
                      </ListItem>
                      {selectedLocation.details?.contact && (
                        <>
                      <ListItem>
                        <ListItemIcon>
                          <Phone />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Reception"
                          secondary={selectedLocation.details.contact.phone}
                          sx={{ '& .MuiTypography-root': { color: '#475569' } }}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          <Email />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Email"
                          secondary={selectedLocation.details.contact.email}
                          sx={{ '& .MuiTypography-root': { color: '#475569' } }}
                        />
                      </ListItem>
                      {selectedLocation.details.contact.website && (
                        <ListItem>
                          <ListItemIcon>
                            <Web />
                          </ListItemIcon>
                          <ListItemText 
                            primary="Website"
                            secondary={selectedLocation.details.contact.website}
                            sx={{ '& .MuiTypography-root': { color: '#475569' } }}
                          />
                        </ListItem>
                      )}
                        </>
                      )}
                      {selectedLocation.details?.timings && (
                      <ListItem>
                        <ListItemIcon>
                          <AccessTime />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Opening Hours"
                          secondary={selectedLocation.details.timings}
                          sx={{ '& .MuiTypography-root': { color: '#475569' } }}
                        />
                      </ListItem>
                      )}
                    </List>
                  </Box>

                  {/* Admission Fees */}
                  {selectedLocation.admissionFees && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                        Admission Fees
                      </Typography>
                      <List dense>
                        <ListItem>
                          <ListItemText 
                            primary="Adults (Ages 13+)"
                            secondary={`₹${selectedLocation.admissionFees.adult}`}
                            sx={{ '& .MuiTypography-root': { color: '#475569' } }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Children (Ages 5-12)"
                            secondary={`₹${selectedLocation.admissionFees.child}`}
                            sx={{ '& .MuiTypography-root': { color: '#475569' } }}
                          />
                        </ListItem>
                        <ListItem>
                          <ListItemText 
                            primary="Infants (Below 5 years)"
                            secondary="Free"
                            sx={{ '& .MuiTypography-root': { color: '#475569' } }}
                          />
                        </ListItem>
                      </List>
                    </Box>
                  )}

                  {/* Facilities */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                      Facilities & Amenities
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {selectedLocation.details?.facilities?.map((facility) => (
                        <Chip
                          key={facility}
                          label={facility}
                          sx={{ 
                            bgcolor: '#f1f5f9',
                            color: '#475569',
                            '&:hover': { bgcolor: '#e2e8f0' }
                          }}
                        />
                      ))}
                    </Box>
                  </Box>

                  {/* Sports Complex Features */}
                  {selectedLocation.details?.features && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                        Complex Features
                      </Typography>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1, fontWeight: 600 }}>
                          Facility Highlights
                      </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedLocation.details.features.highlights.map((highlight) => (
                            <Chip 
                              key={highlight}
                              label={highlight}
                              sx={{ 
                                bgcolor: '#fff7ed',
                                color: '#c2410c',
                                border: '1px solid #fed7aa',
                                '&:hover': { bgcolor: '#ffedd5' }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1, fontWeight: 600 }}>
                          Available Amenities
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedLocation.details.features.amenities.map((amenity) => (
                            <Chip 
                              key={amenity}
                              label={amenity}
                              sx={{ 
                                bgcolor: '#f0fdf4',
                                color: '#15803d',
                                border: '1px solid #bbf7d0',
                                '&:hover': { bgcolor: '#dcfce7' }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Membership Information */}
                  {selectedLocation.details?.membership && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                        Membership & Access
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1, fontWeight: 600 }}>
                          Open To
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedLocation.details.membership.categories.map((category) => (
                            <Chip 
                              key={category}
                              label={category}
                              sx={{ 
                                bgcolor: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                '&:hover': { bgcolor: '#dbeafe' }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                      <List dense>
                        {selectedLocation.details.membership.access.map((access) => (
                          <ListItem key={access.type}>
                            <ListItemIcon>
                              <CheckCircle sx={{ color: '#16a34a' }} />
                            </ListItemIcon>
                            <ListItemText 
                              primary={access.type}
                              secondary={access.requirements}
                              sx={{ 
                                '& .MuiTypography-primary': { 
                                  color: '#475569',
                                  fontWeight: 500
                                },
                                '& .MuiTypography-secondary': {
                                  color: '#64748b'
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Restaurant Specialties */}
                  {selectedLocation?.details?.specialties && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                        Menu Highlights
                      </Typography>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1, fontWeight: 600 }}>
                          Popular Dishes
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedLocation.details?.specialties?.popular?.map((dish) => (
                            <Chip 
                              key={dish}
                              label={dish}
                              sx={{ 
                                bgcolor: '#fff7ed',
                                color: '#c2410c',
                                border: '1px solid #fed7aa',
                                '&:hover': { bgcolor: '#ffedd5' }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1, fontWeight: 600 }}>
                          Customer Favorites
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedLocation.details?.specialties?.customerFavorites?.map((dish) => (
                            <Chip 
                              key={dish}
                              label={dish}
                              sx={{ 
                                bgcolor: '#f0fdf4',
                                color: '#15803d',
                                border: '1px solid #bbf7d0',
                                '&:hover': { bgcolor: '#dcfce7' }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                    </Box>
                  )}

                  {/* Restaurant Services */}
                  {selectedLocation?.details?.services && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                        Available Services
                      </Typography>
                      <List dense>
                        {selectedLocation.details?.services?.map((service) => (
                          <ListItem key={service.name}>
                            <ListItemIcon>
                              {service.available ? (
                                <CheckCircle sx={{ color: '#16a34a' }} />
                              ) : (
                                <Cancel sx={{ color: '#dc2626' }} />
                              )}
                            </ListItemIcon>
                            <ListItemText 
                              primary={service.name}
                              sx={{ 
                                '& .MuiTypography-root': { 
                                  color: service.available ? '#15803d' : '#dc2626',
                                  fontWeight: 500
                                }
                              }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Events */}
                  {selectedLocation?.details?.events && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                        Regular Events
                      </Typography>
                      <List dense>
                        {selectedLocation.details?.events?.map((event) => (
                          <ListItem key={event.name}>
                            <ListItemText
                              primary={event.name}
                              secondary={`${event.date} - ${event.description}`}
                              sx={{ '& .MuiTypography-root': { color: '#475569' } }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Box>
                  )}

                  {/* Academic Programs */}
                  {selectedLocation?.details?.academic && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                        Academic Programs
                      </Typography>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1, fontWeight: 600 }}>
                          Available Programs
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedLocation.details?.academic?.programs?.map((program) => (
                            <Chip 
                              key={program}
                              label={program}
                              sx={{ 
                                bgcolor: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                '&:hover': { bgcolor: '#dbeafe' }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1, fontWeight: 600 }}>
                          Entrance Exams Accepted
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                          {selectedLocation.details?.academic?.entranceExams?.map((exam) => (
                            <Chip 
                              key={exam}
                              label={exam}
                              sx={{ 
                                bgcolor: '#f0fdf4',
                                color: '#15803d',
                                border: '1px solid #bbf7d0',
                                '&:hover': { bgcolor: '#dcfce7' }
                              }}
                            />
                          ))}
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1, fontWeight: 600 }}>
                          Placement Highlights
                        </Typography>
                        <Paper 
                          elevation={0}
                          sx={{ 
                            p: 2, 
                            bgcolor: '#f8fafc',
                            borderRadius: 2
                          }}
                        >
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" sx={{ color: '#475569', mb: 0.5 }}>
                                Placement Rate
                              </Typography>
                              <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
                                {selectedLocation.details?.academic?.placement?.rate}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" sx={{ color: '#475569', mb: 0.5 }}>
                                Highest Package
                              </Typography>
                              <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
                                {selectedLocation.details?.academic?.placement?.highestPackage}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <Typography variant="subtitle2" sx={{ color: '#475569', mb: 0.5 }}>
                                Average Package
                              </Typography>
                              <Typography variant="h6" sx={{ color: '#1e293b', fontWeight: 600 }}>
                                {selectedLocation.details?.academic?.placement?.averagePackage}
                              </Typography>
                            </Grid>
                            <Grid item xs={12}>
                              <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1 }}>
                                Top Recruiters
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {selectedLocation.details?.academic?.placement?.topRecruiters?.map((recruiter) => (
                                  <Chip 
                                    key={recruiter}
                                    label={recruiter}
                                    size="small"
                                    sx={{ 
                                      bgcolor: '#fff7ed',
                                      color: '#c2410c',
                                      border: '1px solid #fed7aa',
                                      '&:hover': { bgcolor: '#ffedd5' }
                                    }}
                                  />
                                ))}
                              </Box>
                            </Grid>
                          </Grid>
                        </Paper>
                      </Box>
                    </Box>
                  )}
                </Grid>

                <Grid item xs={12} md={4}>
                  {/* Ratings and Reviews */}
                  <Paper 
                    elevation={0}
                    sx={{ 
                      p: 2, 
                      mb: 3, 
                      bgcolor: '#f8fafc',
                      borderRadius: 2
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Rating 
                        value={selectedLocation?.details?.rating} 
                        precision={0.1} 
                        readOnly 
                        sx={{ color: '#f59e0b' }}
                      />
                      <Typography 
                        variant="body2" 
                        sx={{ ml: 1, color: '#475569' }}
                      >
                        {selectedLocation?.details?.rating}
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                      Based on {selectedLocation?.details?.reviews} reviews
                    </Typography>
                  </Paper>

                  {/* Capacity Info */}
                  {selectedLocation?.details?.capacity && (
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        mb: 3, 
                        bgcolor: '#f8fafc',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1 }}>
                        Capacity
                      </Typography>
                      <Typography variant="h5" sx={{ color: '#1e293b', fontWeight: 600 }}>
                        {selectedLocation.details?.capacity?.toLocaleString()} people
                      </Typography>
      </Paper>
                  )}

                  {/* Accessibility Features */}
                  {selectedLocation?.details?.accessibility && (
                    <Paper 
                      elevation={0}
                      sx={{ 
                        p: 2, 
                        bgcolor: '#f8fafc',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ color: '#475569', mb: 1 }}>
                        Accessibility
                      </Typography>
                      <List dense>
                        {selectedLocation.details?.accessibility?.map((feature) => (
                          <ListItem key={feature}>
                            <ListItemText
                              primary={feature}
                              sx={{ '& .MuiTypography-root': { color: '#475569' } }}
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  )}
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2, borderTop: '1px solid #e5e7eb' }}>
              <Button 
                variant="outlined" 
                onClick={handleCloseDetails}
                sx={{
                  borderColor: '#e2e8f0',
                  color: '#475569',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'transparent'
                  }
                }}
              >
                Close
              </Button>
              <Button 
                variant="contained"
                onClick={(e) => {
                  handleCloseDetails();
                  if (selectedLocation) {
                    calculateRoute(selectedLocation, selectedLocation);
                  }
                }}
                startIcon={<Navigation />}
                sx={{
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: 'none',
                    bgcolor: 'primary.dark'
                  }
                }}
              >
                Get Directions
              </Button>
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