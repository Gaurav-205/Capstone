import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import ReactMapGL, { 
  Marker, 
  NavigationControl, 
  FullscreenControl, 
  GeolocateControl,
  ViewStateChangeEvent,
  MapRef,
  GeolocateResultEvent
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
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  Rating,
  SelectChangeEvent,
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
  AccessTime,
  Phone,
  Email,
  Web,
  LocationOn,
  Home,
  Science,
  Business,
  Navigation,
  Announcement,
  Event,
  CheckCircle,
  Cancel,
  Museum,
  Church,
} from '@mui/icons-material';
import { Location as MapLocation, ViewState as MapViewState, RouteInfo as MapRouteInfo } from '../types/map';
import {
  clusterMarkers,
  filterVisibleMarkers,
  memoizeMarkerData,
  monitorMarkerPerformance,
} from '../utils/markerOptimization';

// Use the Mapbox token from environment variables
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN || '';

// Campus center coordinates (MIT World Peace Dome)
const CAMPUS_CENTER: MapViewState = {
  latitude: 18.492462959666025,
  longitude: 74.02553149122912,
  zoom: 16.5,
  bearing: 0,
  pitch: 0
};

// Map styles
const MAP_STYLES = [
  { id: 'streets-v12', name: 'Streets' },
  { id: 'satellite-v9', name: 'Satellite' },
  { id: 'dark-v11', name: 'Dark' }
];

// Enhanced locations data for MIT ADT University
const locations: MapLocation[] = [
  {
    id: 'world-peace-dome',
    name: 'World Peace Dome',
    type: 'landmark',
    coordinates: [74.02553149122912, 18.492462959666025],
    description: 'The World Peace Dome at MIT-ADT University is a magnificent architectural marvel dedicated to promoting peace and harmony.',
    icon: <Church sx={{ color: '#5E35B1' }} />,
    details: {
      contact: {
        phone: '+91 83800 23755',
        email: 'director.wpd@worldpeacedome.in',
        website: 'worldpeacedome.in'
      },
      timings: '10:00 AM - 7:00 PM',
      facilities: [
        'World Peace Prayer Hall',
        'Bronze Statue Gallery',
        'World Peace Library',
        'Meditation Area',
        'Conference Hall',
        'Exhibition Space',
        'Cultural Center'
      ],
      rating: 4.4,
      reviews: 665,
      capacity: 3000,
      services: [
        { name: 'Guided Tours', available: true },
        { name: 'Prayer Services', available: true },
        { name: 'Meditation Sessions', available: true },
        { name: 'Library Access', available: true }
      ]
    },
    address: 'Railway station, Vishwarajbaug, MIT-ADT University Campus, Solapur Rd, Loni Kalbhor, Maharashtra 412201',
    admissionFees: {
      adult: 100,
      child: 50,
      infant: 0
    }
  },
  {
    id: 'sports-complex',
    name: 'MIT ADT Sports Complex',
    type: 'sports',
    coordinates: [74.02844225141602, 18.4917779125069],
    description: 'A comprehensive sports facility offering various indoor and outdoor activities for students, faculty, and registered members.',
    icon: <SportsSoccer sx={{ color: '#880E4F' }} />,
    details: {
      timings: '6:00 AM - 9:00 PM',
      facilities: [
        'Swimming Pool',
        'Football Ground',
        'Cricket Nets & Ground',
        'Badminton Courts',
        'Tennis Courts',
        'Gym & Fitness Center',
        'Running Track'
      ],
      rating: 4.5,
      reviews: 99,
      membership: {
        categories: ['MIT ADT University students', 'Faculty', 'Registered members'],
        access: [
          {
            type: 'Student Access',
            requirements: 'Valid student ID required'
          },
          {
            type: 'Faculty Access',
            requirements: 'Faculty ID required'
          },
          {
            type: 'Guest Access',
            requirements: 'Prior approval required'
          }
        ]
      },
      features: {
        highlights: [
          'Olympic-sized Swimming Pool',
          'Professional Football Ground',
          'Multi-purpose Courts',
          'Modern Fitness Center'
        ],
        amenities: [
          'Changing Rooms',
          'Lockers',
          'Equipment Rental',
          'First Aid Station',
          'Water Dispensers'
        ]
      }
    },
    address: 'F2RJ+WFV, MAEER MIT\'S Swimming Pool, Unnamed Road, Loni Kalbhor, Maharashtra 412201'
  },
  {
    id: 'serenity-restaurant',
    name: 'Serenity - Multicuisine Restaurant',
    type: 'food',
    coordinates: [74.02749795999576, 18.49198394522407],
    description: 'A vibrant multicuisine restaurant offering a diverse menu in an airy, casual dining atmosphere.',
    icon: <Restaurant sx={{ color: '#C2185B' }} />,
    details: {
      timings: '9:00 AM - 10:00 PM',
      rating: 4.1,
      reviews: 211,
      services: [
        { name: 'Dine-in', available: true },
        { name: 'Drive-through', available: true },
        { name: 'No-contact delivery', available: true }
      ],
      specialties: {
        popular: [
          'Pizza',
          'Steamed Dumplings (Momos)',
          'Sandwiches',
          'Mocktails'
        ],
        customerFavorites: [
          'Paneer Dishes',
          'Pizza Margherita',
          'Ice Cream'
        ],
        ambience: [
          'Airy Space',
          'Casual Dining',
          'Modern Decor'
        ]
      },
      facilities: [
        'Air Conditioning',
        'Outdoor Seating',
        'Private Dining Area',
        'Wheelchair Accessible',
        'Free Wi-Fi'
      ]
    },
    address: 'MIT CAMPUS, RAJBAUG, near Vishwaraj Hospital, Loni Kalbhor, Maharashtra 412201'
  },
  {
    id: 'shivaji-statue',
    name: 'Chatrapati Shivaji Maharaj Statue',
    type: 'landmark',
    coordinates: [74.02539744285934, 18.49052554616454],
    description: 'A historical and cultural landmark dedicated to the legendary Maratha ruler, Chhatrapati Shivaji Maharaj, symbolizing bravery and leadership.',
    icon: <Museum sx={{ color: '#5E35B1' }} />,
    details: {
      rating: 4.8,
      reviews: 5,
      facilities: [
        'Historical Monument',
        'Cultural Heritage Site',
        'Tourist Attraction',
        'Open Space for Visitors'
      ]
    },
    address: 'F2RG+54Q, MIT Institute of Design Rd, Loni Kalbhor, Maharashtra 412201'
  }
];

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
    const { latitude, longitude, zoom } = evt.viewState;
    setViewState({ latitude, longitude, zoom, bearing: 0, pitch: 0 });
  }, []);

  // Optimized marker rendering
  const visibleMarkers = useMemo(() => {
    if (!mapRef.current) return locations; // Return all locations if map is not ready

    try {
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
      
      return clustered.length > 0 ? clustered : locations; // Return all locations if no markers are visible
    } catch (error) {
      console.error('Error getting map bounds:', error);
      return locations; // Return all locations on error
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
  const handleMarkerClick = useCallback((marker: MapLocation) => {
    setSelectedLocation(marker);
    setViewState({
      ...viewState,
      longitude: marker.coordinates[0],
      latitude: marker.coordinates[1],
      zoom: 18
    });
    setShowDetails(true);
  }, [viewState]);

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

  const renderMarkers = (): React.ReactNode => {
    return visibleMarkers.map((location) => (
      <Marker
        key={location.id}
        longitude={location.coordinates[0]}
        latitude={location.coordinates[1]}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          setSelectedLocation(location);
          setShowDetails(true);
        }}
      >
        <Tooltip
          title={location.name}
          arrow
          placement="top"
          enterDelay={200}
          leaveDelay={0}
        >
          <Box
            sx={{
              cursor: 'pointer',
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                backgroundColor: 'white',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                zIndex: 1
              },
              '& svg': {
                position: 'relative',
                zIndex: 2,
                fontSize: 24,
                color: LOCATION_TYPES.find(t => t.type === location.type)?.color,
                transition: 'all 0.2s ease-in-out',
              },
              '&:hover': {
                '& svg': {
                  transform: 'scale(1.1)',
                },
                '&::before': {
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                },
              },
            }}
          >
            {location.icon}
          </Box>
        </Tooltip>
      </Marker>
    ));
  };

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
            right: '20px',
            display: 'flex', 
            flexDirection: 'column', 
            gap: 1,
            zIndex: 1
          }}>
            <GeolocateControl 
              position="top-right"
              onGeolocate={(e: GeolocateResultEvent) => {
                console.log('User location:', e.coords);
              }}
              style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
            />
            <FullscreenControl 
              position="top-right"
              style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
            />
            <NavigationControl 
              position="top-right"
              showCompass={true}
              showZoom={true}
              visualizePitch={true}
              style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
            />
          </Box>

          {/* Markers */}
          {renderMarkers()}
        </ReactMapGL>
      </Box>

      {/* Right Panel */}
      <Paper
        elevation={0}
        sx={{
          width: '320px',
          height: '100%',
          bgcolor: '#ffffff',
          borderLeft: '1px solid #E1BEE7',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          flexShrink: 0,
          overflowY: 'auto'
        }}
      >
        {/* Map Style Controls */}
        <Box sx={{ p: 2, borderBottom: '1px solid #e5e7eb' }}>
          <Typography variant="subtitle2" sx={{ 
            color: '#475569',
            fontWeight: 600,
            mb: 1.5
          }}>
            Map Style
          </Typography>
          <ToggleButtonGroup
            value={mapStyle}
            exclusive
            onChange={handleStyleChange}
            orientation="vertical"
            size="small"
            sx={{
              display: 'flex',
              width: '100%',
              '& .MuiToggleButton-root': {
                justifyContent: 'flex-start',
                textTransform: 'none',
                py: 1,
                borderRadius: '4px !important',
                mb: 0.5,
                border: '1px solid #e2e8f0',
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
                  {selectedLocation.details?.contact && (
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                      Contact Information
                    </Typography>
                    <List dense>
                        {selectedLocation.details.contact?.phone && (
                      <ListItem>
                            <ListItemIcon><Phone sx={{ color: '#3b82f6' }} /></ListItemIcon>
                        <ListItemText 
                              primary="Phone"
                              secondary={selectedLocation.details.contact?.phone}
                          sx={{ '& .MuiTypography-root': { color: '#475569' } }}
                        />
                      </ListItem>
                        )}
                        {selectedLocation.details.contact?.email && (
                      <ListItem>
                            <ListItemIcon><Email sx={{ color: '#3b82f6' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Email"
                              secondary={selectedLocation.details.contact?.email}
                          sx={{ '& .MuiTypography-root': { color: '#475569' } }}
                        />
                      </ListItem>
                        )}
                        {selectedLocation.details.contact?.website && (
                        <ListItem>
                            <ListItemIcon><Web sx={{ color: '#3b82f6' }} /></ListItemIcon>
                          <ListItemText 
                            primary="Website"
                              secondary={selectedLocation.details.contact?.website}
                            sx={{ '& .MuiTypography-root': { color: '#475569' } }}
                          />
                        </ListItem>
                      )}
                      </List>
                    </Box>
                      )}

                      {selectedLocation.details?.timings && (
                    <Box sx={{ mb: 4 }}>
                      <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: '#1e293b' }}>
                        Operating Hours
                      </Typography>
                      <ListItem>
                        <ListItemIcon><AccessTime sx={{ color: '#3b82f6' }} /></ListItemIcon>
                        <ListItemText 
                          primary="Opening Hours"
                          secondary={selectedLocation.details?.timings}
                          sx={{ '& .MuiTypography-root': { color: '#475569' } }}
                        />
                      </ListItem>
                  </Box>
                  )}

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
                  {selectedLocation.details?.facilities && selectedLocation.details?.facilities.length > 0 ? (
                    selectedLocation.details?.facilities?.map((facility) => (
                      <ListItem key={facility}>
                        <ListItemIcon><CheckCircle sx={{ color: '#16a34a' }} /></ListItemIcon>
                            <ListItemText 
                          primary={facility}
                          sx={{ '& .MuiTypography-root': { color: '#475569' } }}
                            />
                          </ListItem>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No facilities information available</Typography>
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
                      <Typography variant="h4" sx={{ fontWeight: 700, color: '#0f172a' }}>
                        {selectedLocation.details?.capacity ? selectedLocation.details.capacity.toLocaleString() : 'N/A'} people
                      </Typography>
      </Paper>
                  )}

                  {/* Accessibility Features */}
                  {selectedLocation?.details?.accessibility && selectedLocation.details?.accessibility.length > 0 && (
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
              transform: translate(-50%, -50%) scale(1);
              opacity: 0.5;
            }
            50% {
              transform: translate(-50%, -50%) scale(1.5);
              opacity: 0.25;
            }
            100% {
              transform: translate(-50%, -50%) scale(2);
              opacity: 0;
            }
          }
        `}
      </style>
    </Box>
  );
};

export default CampusMap; 