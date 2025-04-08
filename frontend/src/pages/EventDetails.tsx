import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  Chip,
  Grid,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Alert,
  Breadcrumbs,
  Link,
  Card,
  CardMedia,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  ArrowBack as ArrowBackIcon,
  Share as ShareIcon,
} from '@mui/icons-material';
import eventService, { Event } from '../services/eventService';
import MainLayout from '../layouts/MainLayout';
import EventRegistrationButton from '../components/EventRegistrationButton';
import { useTheme } from '@mui/material/styles';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError('Event ID not provided');
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        const data = await eventService.getEvent(id);
        
        if (!data) {
          setError('Event not found');
        } else {
          setEvent(data);
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvent();
  }, [id]);
  
  const handleShare = async () => {
    if (!event) return;
    
    try {
      if (navigator.share) {
        await navigator.share({
          title: event.title,
          text: event.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };
  
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString;
    }
  };
  
  const getEventTypeColor = (type: string): "primary" | "secondary" | "success" | "warning" => {
    switch (type) {
      case 'academic': return 'primary';
      case 'social': return 'secondary';
      case 'sports': return 'success';
      case 'cultural': return 'warning';
      default: return 'primary';
    }
  };
  
  const renderHero = () => {
    if (!event) return null;
    
    return (
      <Box 
        sx={{ 
          position: 'relative',
          height: event.imageUrl ? '300px' : '150px',
          bgcolor: theme.palette.primary.main,
          mb: 4,
          color: 'white',
          borderRadius: { xs: 0, sm: 2 },
          overflow: 'hidden'
        }}
      >
        {event.imageUrl ? (
          <>
            <Box 
              sx={{ 
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `url(${event.imageUrl})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                zIndex: 1,
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.7))'
                }
              }}
            />
            <Box 
              sx={{ 
                position: 'relative',
                zIndex: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                p: 3
              }}
            >
              <Typography variant="overline" sx={{ color: 'white', opacity: 0.85 }}>
                {event.type.charAt(0).toUpperCase() + event.type.slice(1)} Event
              </Typography>
              <Typography variant="h4" component="h1" fontWeight="bold" sx={{ mb: 2 }}>
                {event.title}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CalendarIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2" sx={{ mr: 3 }}>
                  {event.isMultiDay ? (
                    <>
                      {formatDate(event.startDate || event.date)} - {formatDate(event.endDate || event.date)}
                    </>
                  ) : (
                    formatDate(event.date)
                  )}
                </Typography>
                <TimeIcon fontSize="small" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  {event.isMultiDay ? (
                    <>
                      {event.startTime || event.time} - {event.endTime || event.time}
                    </>
                  ) : (
                    event.time
                  )}
                </Typography>
              </Box>
            </Box>
          </>
        ) : (
          <Box 
            sx={{ 
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              p: 3,
              textAlign: 'center'
            }}
          >
            <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
              {event.title}
            </Typography>
            <Typography variant="subtitle1">
              {event.type.charAt(0).toUpperCase() + event.type.slice(1)} Event
            </Typography>
          </Box>
        )}
      </Box>
    );
  };
  
  if (loading) {
    return (
      <MainLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }
  
  if (error || !event) {
    return (
      <MainLayout>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>
            {error || 'Event not found'}
          </Alert>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/news-events')}
            variant="outlined"
          >
            Back to Events
          </Button>
        </Container>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link color="inherit" href="/" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            Home
          </Link>
          <Link color="inherit" href="/news-events" onClick={(e) => { e.preventDefault(); navigate('/news-events'); }}>
            Events
          </Link>
          <Typography color="text.primary">{event.title}</Typography>
        </Breadcrumbs>

        {renderHero()}

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper sx={{ p: 3, mb: 4, borderRadius: '12px', boxShadow: 2 }}>
              {/* Event description */}
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                About This Event
              </Typography>
              <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line' }}>
                {event.description}
              </Typography>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, borderRadius: '12px', position: 'sticky', top: 20, boxShadow: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Event Details
              </Typography>
              
              <List disablePadding>
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon>
                    <CalendarIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography variant="subtitle2">Date</Typography>}
                    secondary={
                      event.isMultiDay ? (
                        <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                          <Typography variant="body2">
                            From: {formatDate(event.startDate || event.date)}
                          </Typography>
                          <Typography variant="body2">
                            To: {formatDate(event.endDate || event.date)}
                          </Typography>
                        </Box>
                      ) : (
                        formatDate(event.date)
                      )
                    }
                  />
                </ListItem>
                
                <Divider component="li" />
                
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon>
                    <TimeIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography variant="subtitle2">Time</Typography>}
                    secondary={
                      event.isMultiDay ? (
                        <Box component="span" sx={{ display: 'block', mt: 0.5 }}>
                          <Typography variant="body2">
                            From: {event.startTime || event.time}
                          </Typography>
                          <Typography variant="body2">
                            To: {event.endTime || event.time}
                          </Typography>
                        </Box>
                      ) : (
                        event.time
                      )
                    }
                  />
                </ListItem>
                
                <Divider component="li" />
                
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon>
                    <LocationIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary={<Typography variant="subtitle2">Location</Typography>}
                    secondary={event.location}
                  />
                </ListItem>
                
                <Divider component="li" />
                
                <ListItem sx={{ px: 0, py: 1.5 }}>
                  <ListItemIcon>
                    <Chip 
                      label={event.type.charAt(0).toUpperCase() + event.type.slice(1)} 
                      color={getEventTypeColor(event.type)}
                      size="small"
                    />
                  </ListItemIcon>
                  <Box sx={{ ml: 'auto' }}>
                    <IconButton onClick={handleShare} color="primary" size="small">
                      <ShareIcon />
                    </IconButton>
                  </Box>
                </ListItem>
              </List>
              
              {/* Registration button */}
              {event.registrationUrl && (
                <Box mt={3}>
                  <EventRegistrationButton 
                    registrationUrl={event.registrationUrl}
                    buttonProps={{
                      variant: "contained",
                      size: "large",
                      fullWidth: true,
                    }}
                    label="Register for Event"
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 1 }}>
                    Registration is required to attend this event
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
        
        <Box mt={3}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => navigate('/news-events')}
            variant="outlined"
          >
            Back to Events
          </Button>
        </Box>
      </Container>
    </MainLayout>
  );
};

export default EventDetails; 