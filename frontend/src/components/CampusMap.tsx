import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Stack,
  InputAdornment,
  Chip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

// Set the access token
const MAPBOX_TOKEN = process.env.REACT_APP_MAPBOX_TOKEN;
if (!MAPBOX_TOKEN) {
  console.error('Mapbox access token is required. Please add REACT_APP_MAPBOX_TOKEN to your .env file');
} else {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

// Define location types for filtering
const locationTypes = [
  { value: 'academic_building', label: 'Academic Buildings' },
  { value: 'hostel', label: 'Student Hostels' },
  { value: 'cafeteria', label: 'Cafeterias' },
  { value: 'library', label: 'Libraries' },
  { value: 'bus_stop', label: 'Campus Bus Stops' },
  { value: 'parking', label: 'Parking Areas' },
  { value: 'sports_complex', label: 'Sports Complex' },
  { value: 'student_center', label: 'Student Activity Center' },
  { value: 'medical_center', label: 'Medical Center' },
  { value: 'computer_center', label: 'Computer Center' },
  { value: 'auditorium', label: 'Auditoriums' },
  { value: 'research_center', label: 'Research Centers' },
  { value: 'admin_building', label: 'Administrative Buildings' },
  { value: 'campus_gate', label: 'Campus Gates' },
  { value: 'walkway', label: 'Main Walkways' },
];

const CampusMap: React.FC = () => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [mapStyle, setMapStyle] = useState('streets-v11');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Clear any existing map instance
    if (map.current) {
      map.current.remove();
      map.current = null;
    }

    try {
      const newMap = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [74.02573945809637, 18.492511576539684],
        zoom: 16,
        pitch: 0,
        bearing: 0,
        maxBounds: [
          // Southwest coordinates (approximately 10km in each direction)
          [73.91573945809637, 18.402511576539684],
          // Northeast coordinates (approximately 10km in each direction)
          [74.13573945809637, 18.582511576539684]
        ],
        interactive: true,
        touchZoomRotate: true,
        dragRotate: false,
        touchPitch: false,
        cooperativeGestures: true,
        attributionControl: false,
        minZoom: 12,
        maxZoom: 19
      } as any);

      map.current = newMap;

      // Add geolocation control
      const geolocateControl = new (mapboxgl as any).GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true,
        showUserHeading: true
      });

      // Add the geolocation control
      newMap.addControl(geolocateControl, 'top-right');

      // Add passive event listeners to the map container
      if (mapContainer.current) {
        const options = { passive: true };
        mapContainer.current.addEventListener('touchstart', () => {}, options);
        mapContainer.current.addEventListener('touchmove', () => {}, options);
        mapContainer.current.addEventListener('touchend', () => {}, options);
        mapContainer.current.addEventListener('wheel', () => {}, options);
      }

      // Wait for map to load
      (newMap as any).on('load', () => {
        setIsLoading(false);
      });

      // Handle map errors
      (newMap as any).on('error', (e: Error) => {
        console.error('Map error:', e);
        setError('Failed to load map. Please try again later.');
      });

    } catch (err) {
      console.error('Map initialization error:', err);
      setError('Failed to initialize map. Please try again later.');
    }

    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Handle search with filters
  const handleSearch = () => {
    if (!map.current) return;

    const searchParams = new URLSearchParams({
      access_token: MAPBOX_TOKEN || '',
      types: selectedTypes.join(','),
      limit: '50',
      country: 'in',
      language: 'en',
      bbox: '74.02473945809637,18.491511576539684,74.02673945809637,18.493511576539684', // Restrict to campus area
    });

    if (searchQuery.trim()) {
      searchParams.append('q', searchQuery);
    }

    // Add proximity to university coordinates for better local results
    searchParams.append('proximity', '74.02573945809637,18.492511576539684');

    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery || '')}.json?${searchParams}`
    )
      .then(response => response.json())
      .then(data => {
        if (data.features && data.features.length > 0) {
          const [lng, lat] = data.features[0].center;
          (map.current as any).flyTo({
            center: [lng, lat],
            zoom: 17, // Increased zoom for better campus view
            duration: 2000
          });
        }
      })
      .catch(err => {
        console.error('Search error:', err);
        setError('Failed to search location. Please try again.');
      });
  };

  // Handle style change
  const handleStyleChange = (style: string) => {
    setMapStyle(style);
    if (map.current) {
      (map.current as any).setStyle(`mapbox://styles/mapbox/${style}`, { diff: false });
    }
  };

  // Handle type selection
  const handleTypeChange = (event: any) => {
    setSelectedTypes(event.target.value);
  };

  return (
    <Box sx={{ position: 'relative' }}>
      {/* Top Controls */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{
          position: 'absolute',
          top: 16,
          left: 16,
          right: 16,
          zIndex: 1,
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          borderRadius: 2,
          p: 2,
          backdropFilter: 'blur(8px)',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <TextField
          placeholder="Search campus buildings and facilities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          size="small"
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: {
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
              },
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 250 } }}>
          <InputLabel>Filter by campus facility</InputLabel>
          <Select
            multiple
            value={selectedTypes}
            onChange={handleTypeChange}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((value) => (
                  <Chip 
                    key={value} 
                    label={locationTypes.find(type => type.value === value)?.label || value} 
                    size="small"
                    sx={{
                      backgroundColor: 'primary.light',
                      color: 'primary.contrastText',
                    }}
                  />
                ))}
              </Box>
            )}
            sx={{
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
              },
            }}
          >
            {locationTypes.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl size="small" sx={{ minWidth: { xs: '100%', md: 120 } }}>
          <InputLabel>Map style</InputLabel>
          <Select
            value={mapStyle}
            onChange={(e) => handleStyleChange(e.target.value)}
            sx={{
              borderRadius: 2,
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.02)',
              },
            }}
          >
            <MenuItem value="streets-v11">Streets</MenuItem>
            <MenuItem value="satellite-v9">Satellite</MenuItem>
            <MenuItem value="light-v10">Light</MenuItem>
            <MenuItem value="dark-v10">Dark</MenuItem>
            <MenuItem value="outdoors-v11">Outdoors</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Map Container */}
      <Paper 
        elevation={4} 
        sx={{ 
          height: '700px', 
          width: '100%', 
          position: 'relative',
          overflow: 'hidden',
          mt: 12,
          borderRadius: 3,
          '&::after': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            pointerEvents: 'none',
            boxShadow: 'inset 0 0 10px rgba(0,0,0,0.1)',
          }
        }}
        role="region"
        aria-label="Interactive map"
      >
        {/* Zoom Controls - Right Side */}
        <Stack 
          direction="column" 
          spacing={1}
          sx={{
            position: 'absolute',
            right: 16,
            top: '50%',
            transform: 'translateY(-50%)',
            zIndex: 1,
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: 2,
            p: 1,
            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              if (map.current) {
                const currentZoom = (map.current as any).getZoom();
                (map.current as any).easeTo({ zoom: currentZoom + 1, duration: 300 });
              }
            }}
            aria-label="Zoom in"
            sx={{
              minWidth: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'white',
              color: 'primary.main',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white',
              },
            }}
          >
            +
          </Button>
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              if (map.current) {
                const currentZoom = (map.current as any).getZoom();
                (map.current as any).easeTo({ zoom: currentZoom - 1, duration: 300 });
              }
            }}
            aria-label="Zoom out"
            sx={{
              minWidth: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'white',
              color: 'primary.main',
              boxShadow: 'none',
              '&:hover': {
                backgroundColor: 'primary.light',
                color: 'white',
              },
            }}
          >
            -
          </Button>
        </Stack>

        <Box
          ref={mapContainer}
          sx={{
            height: '100%',
            width: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />

        {/* Loading State */}
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(8px)',
            }}
            role="status"
            aria-label="Loading map"
          >
            <CircularProgress size={32} sx={{ color: 'primary.main' }} aria-hidden="true" />
            <Typography sx={{ mt: 2, fontWeight: 500 }}>Loading map...</Typography>
          </Box>
        )}

        {/* Error State */}
        {error && (
          <Box
            sx={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              padding: 3,
              borderRadius: 2,
              boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
              backdropFilter: 'blur(8px)',
            }}
            role="alert"
          >
            <Typography color="error" sx={{ fontWeight: 500 }}>{error}</Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => window.location.reload()}
              sx={{ 
                mt: 2,
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
              }}
              aria-label="Retry loading map"
            >
              Retry
            </Button>
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default CampusMap; 