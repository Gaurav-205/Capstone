import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Fade,
  Alert,
  Snackbar,
  useTheme,
  useMediaQuery,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
  CardMedia,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  Share as ShareIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import EventRegistrationButton from './EventRegistrationButton';
import eventService from '../services/eventService';
import newsService from '../services/newsService';

interface NewsItem {
  id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
}

interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'academic' | 'social' | 'sports' | 'cultural';
  registrationUrl?: string;
  imageUrl?: string;
  isMultiDay?: boolean;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

interface AddItemFormData {
  title: string;
  content: string;
  category?: string;
  priority?: 'high' | 'medium' | 'low';
  description?: string;
  date: string;
  time?: string;
  location?: string;
  type?: 'academic' | 'social' | 'sports' | 'cultural';
  registrationUrl?: string;
}

const NewsAndEvents: React.FC<{ isAdmin?: boolean }> = ({ isAdmin = false }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState<NewsItem | EventItem | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' as 'info' | 'success' | 'error' });
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [addItemType, setAddItemType] = useState<'news' | 'event'>('news');
  const [formData, setFormData] = useState<AddItemFormData>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDashboard = location.pathname === '/dashboard';

  // Fetch news and events on component mount
  useEffect(() => {
    fetchNewsAndEvents();
  }, []);

  const fetchNewsAndEvents = async () => {
    setLoading(true);
    try {
      // Fetch news
      const newsData = await newsService.getNews();
      const mappedNews: NewsItem[] = newsData.map(news => ({
        id: news._id,
        title: news.title,
        content: news.content,
        date: news.date,
        category: news.category,
        priority: news.priority,
      }));
      setNewsItems(mappedNews);

      // Fetch events
      const eventsData = await eventService.getEvents();
      const mappedEvents: EventItem[] = eventsData.map(event => ({
        id: event._id,
        title: event.title,
        description: event.description,
        date: event.date,
        time: event.time,
        location: event.location,
        type: event.type as 'academic' | 'social' | 'sports' | 'cultural',
        registrationUrl: event.registrationUrl,
        imageUrl: event.imageUrl,
        isMultiDay: event.isMultiDay,
        startDate: event.startDate,
        endDate: event.endDate,
        startTime: event.startTime,
        endTime: event.endTime,
      }));
      setEvents(mappedEvents);
    } catch (error) {
      console.error('Error fetching news and events:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load news and events',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    <Tab key="news" label={
      <Box display="flex" alignItems="center">
        NEWS
        {newsItems.some(news => news.priority === 'high') && (
          <Chip 
            size="small" 
            color="error" 
            label="!" 
            sx={{ ml: 1, height: 20, minWidth: 20 }}
          />
        )}
      </Box>
    } />,
    <Tab key="events" label={
      <Box display="flex" alignItems="center">
        EVENTS
        <Chip 
          size="small" 
          label={events.length} 
          sx={{ ml: 1, height: 20, minWidth: 20 }}
        />
      </Box>
    } />,
  ];

  const handleReadMore = (item: NewsItem | EventItem) => {
    setSelectedItem(item);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setSelectedItem(null);
    setOpenDialog(false);
  };

  const handleShare = async (item: NewsItem | EventItem) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: item.title,
          text: 'content' in item ? item.content : item.description,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setSnackbar({ open: true, message: 'Link copied to clipboard!', severity: 'success' });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'default';
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

  const renderSkeletons = () => (
    <Grid container spacing={3}>
      {[1, 2].map((key) => (
        <Grid item xs={12} md={6} key={key}>
          <Card>
            <CardContent>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="text" width="40%" height={24} />
              <Skeleton variant="rectangular" height={100} />
              <Box mt={2}>
                <Skeleton variant="text" width="30%" />
                <Skeleton variant="text" width="20%" />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  const renderEmptyState = () => (
    <Box textAlign="center" py={4}>
      <Typography variant="h6" color="textSecondary" gutterBottom>
        {activeTab === 0 ? 'No news available' : 'No events scheduled'}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        {activeTab === 0 
          ? 'Check back later for updates'
          : 'Stay tuned for upcoming events'}
      </Typography>
    </Box>
  );

  const handleAddItem = () => {
    setFormData({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      priority: 'medium',
      category: 'Announcement',
      type: 'academic',
    });
    
    setAddItemType(activeTab === 0 ? 'news' : 'event');
    
    setOpenAddDialog(true);
  };

  const handleFormSubmit = async () => {
    try {
      // Validate form
      if (!formData.title || !formData.date || 
          (addItemType === 'news' && !formData.content) || 
          (addItemType === 'event' && (!formData.description || !formData.location || !formData.time))) {
        setSnackbar({ 
          open: true, 
          message: 'Please fill all required fields', 
          severity: 'error' 
        });
        return;
      }
      
      // Here you would integrate with your API to save the new item
      if (addItemType === 'news') {
        // Create news item
        await newsService.createNews({
          title: formData.title,
          content: formData.content,
          date: formData.date,
          category: formData.category || 'General',
          priority: formData.priority || 'medium',
        });
      } else {
        // Create event item
        await eventService.createEvent({
          title: formData.title,
          description: formData.description || '',
          date: formData.date,
          time: formData.time || '12:00',
          location: formData.location || '',
          type: formData.type || 'other',
          registrationUrl: formData.registrationUrl,
        });
      }
      
      // Refresh data
      fetchNewsAndEvents();
      
      // Close dialog and show success message
      setOpenAddDialog(false);
      setSnackbar({ 
        open: true, 
        message: `${addItemType === 'news' ? 'News' : 'Event'} added successfully`,
        severity: 'success'
      });
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error adding item:', error);
      setSnackbar({ 
        open: true, 
        message: 'Error adding item. Please try again.', 
        severity: 'error' 
      });
    }
  };

  const renderAddDialog = () => (
    <Dialog
      open={openAddDialog}
      onClose={() => setOpenAddDialog(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Add New {addItemType === 'news' ? 'News' : 'Event'}
          </Typography>
          <IconButton onClick={() => setOpenAddDialog(false)} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Stack spacing={3} sx={{ mt: 1 }}>
          <TextField
            label="Title"
            fullWidth
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
          
          {addItemType === 'news' ? (
            <>
              <TextField
                label="Content"
                fullWidth
                multiline
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  value={formData.category || ''}
                  label="Category"
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <MenuItem value="Announcement">Announcement</MenuItem>
                  <MenuItem value="Academic">Academic</MenuItem>
                  <MenuItem value="Campus Life">Campus Life</MenuItem>
                  <MenuItem value="Research">Research</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Priority</InputLabel>
                <Select
                  value={formData.priority || ''}
                  label="Priority"
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'high' | 'medium' | 'low' })}
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </>
          ) : (
            <>
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={4}
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <TextField
                label="Location"
                fullWidth
                value={formData.location || ''}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
              <TextField
                label="Registration URL"
                fullWidth
                value={formData.registrationUrl || ''}
                onChange={(e) => setFormData({ ...formData, registrationUrl: e.target.value })}
                placeholder="https://example.com/register"
                helperText="Optional: URL for event registration"
              />
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  value={formData.type || ''}
                  label="Event Type"
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as 'academic' | 'social' | 'sports' | 'cultural' })}
                >
                  <MenuItem value="academic">Academic</MenuItem>
                  <MenuItem value="social">Social</MenuItem>
                  <MenuItem value="sports">Sports</MenuItem>
                  <MenuItem value="cultural">Cultural</MenuItem>
                </Select>
              </FormControl>
            </>
          )}
          
          <TextField
            label="Date"
            type="date"
            fullWidth
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            InputLabelProps={{ shrink: true }}
          />
          
          {addItemType === 'event' && (
            <TextField
              label="Time"
              type="time"
              fullWidth
              value={formData.time || ''}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              required
              InputLabelProps={{ shrink: true }}
            />
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpenAddDialog(false)}>Cancel</Button>
        <Button 
          variant="contained" 
          onClick={handleFormSubmit}
          disabled={!formData.title || !formData.date || (addItemType === 'news' ? !formData.content : !formData.description)}
        >
          Add {addItemType === 'news' ? 'News' : 'Event'}
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Return formatted date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    try {
      const date = new Date(dateString);
      // Return formatted date in a user-friendly format: April 8, 2024
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric'
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return dateString; // Return the original string if there's an error
    }
  };

  return (
    <Box>
      <Paper elevation={3} sx={{ p: 3, mb: 3, mt: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">
            {isDashboard ? 'Latest News' : 'News & Events'}
          </Typography>
          <Box>
            {isAdmin && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddItem}
                sx={{ mr: 2 }}
              >
                Add {activeTab === 0 ? 'News' : 'Event'}
              </Button>
            )}
            {isDashboard && (
              <Button
                component={RouterLink}
                to="/news-events"
                variant="outlined"
                endIcon={<ArrowForwardIcon />}
                sx={{
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'none',
                  },
                }}
              >
                View All
              </Button>
            )}
          </Box>
        </Box>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          sx={{ mb: 3 }}
          variant={isMobile ? "fullWidth" : "standard"}
        >
          {tabs}
        </Tabs>

        {loading ? (
          renderSkeletons()
        ) : activeTab === 0 ? (
          // News Section
          newsItems.length > 0 ? (
            <Fade in timeout={500}>
              <Grid container spacing={3}>
                {newsItems.map((news) => (
                  <Grid item xs={12} md={6} key={news.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flex: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="h6" gutterBottom>
                            {news.title}
                          </Typography>
                        </Box>
                        <Typography color="textSecondary" gutterBottom>
                          {news.category} • {news.date}
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {truncateText(news.content)}
                        </Typography>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'space-between' }}>
                        <Box>
                          <Button 
                            size="small" 
                            startIcon={<ArrowForwardIcon />}
                            onClick={() => handleReadMore(news)}
                          >
                            Read More
                          </Button>
                        </Box>
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={() => handleShare(news)}
                          >
                            <ShareIcon />
                          </IconButton>
                        </Box>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Fade>
          ) : (
            renderEmptyState()
          )
        ) : (
          // Events Section
          events.length > 0 ? (
            <Fade in timeout={500}>
              <Grid container spacing={3}>
                {events.map((event) => (
                  <Grid item xs={12} md={6} key={event.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'visible', boxShadow: 3, borderRadius: 2 }}>
                      {event.imageUrl && (
                        <CardMedia
                          component="img"
                          sx={{ height: 180 }}
                          image={event.imageUrl}
                          alt={event.title}
                        />
                      )}
                      <CardContent sx={{ flex: '1 0 auto', p: 3 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                          <Typography variant="h6" component="h3" fontWeight="600" gutterBottom>
                            {event.title}
                          </Typography>
                          <Chip
                            label={event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            color={getEventTypeColor(event.type)}
                            size="small"
                            sx={{ fontWeight: 500 }}
                          />
                        </Box>
                        
                        <Typography variant="body2" color="text.secondary" paragraph sx={{ 
                          mb: 2, 
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {event.description}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <CalendarIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {event.isMultiDay ? (
                              <>
                                {formatDate(event.startDate || event.date)} - {formatDate(event.endDate || event.date)}
                              </>
                            ) : (
                              formatDate(event.date)
                            )}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {event.isMultiDay ? (
                              <>
                                {event.startTime || event.time} - {event.endTime || event.time}
                              </>
                            ) : (
                              event.time
                            )}
                          </Typography>
                        </Box>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LocationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                          <Typography variant="body2" color="text.secondary">
                            {event.location}
                          </Typography>
                        </Box>
                        
                        {event.registrationUrl && (
                          <Box sx={{ mt: 2 }}>
                            <Button
                              variant="contained"
                              size="small"
                              color="primary"
                              href={event.registrationUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              sx={{ borderRadius: '8px', textTransform: 'none' }}
                              fullWidth
                            >
                              Register Now
                            </Button>
                          </Box>
                        )}
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'space-between', p: 2, pt: 0 }}>
                        <Box display="flex" alignItems="center">
                          <Button 
                            size="small" 
                            startIcon={<ArrowForwardIcon />}
                            onClick={() => handleReadMore(event)}
                          >
                            View Details
                          </Button>
                        </Box>
                        <Box>
                          <IconButton 
                            size="small" 
                            onClick={() => handleShare(event)}
                          >
                            <ShareIcon />
                          </IconButton>
                        </Box>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Fade>
          ) : (
            renderEmptyState()
          )
        )}
      </Paper>

      {/* Read More Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" component="h2" fontWeight="600">
              {selectedItem?.title}
            </Typography>
            <Box>
              {selectedItem && (
                <>
                  <IconButton 
                    size="small" 
                    onClick={() => handleShare(selectedItem)}
                    sx={{ mr: 1 }}
                  >
                    <ShareIcon />
                  </IconButton>
                </>
              )}
              <IconButton onClick={handleCloseDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {selectedItem && (
            'content' in selectedItem ? (
              // News content
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography color="textSecondary">
                    {selectedItem.category} • {selectedItem.date}
                  </Typography>
                </Box>
                <Typography variant="body1" sx={{ whiteSpace: 'pre-line' }}>
                  {selectedItem.content}
                </Typography>
              </>
            ) : (
              // Event content
              <>
                {/* Hero section with image if available */}
                {selectedItem.imageUrl && (
                  <Box sx={{ 
                    width: '100%', 
                    height: 250, 
                    overflow: 'hidden', 
                    borderRadius: 1,
                    mb: 3,
                    position: 'relative'
                  }}>
                    <img 
                      src={selectedItem.imageUrl} 
                      alt={selectedItem.title} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderRadius: 'inherit'
                      }}
                    />
                    <Box 
                      sx={{ 
                        position: 'absolute', 
                        top: 16, 
                        right: 16
                      }}
                    >
                      <Chip
                        label={selectedItem.type.charAt(0).toUpperCase() + selectedItem.type.slice(1)}
                        color={getEventTypeColor(selectedItem.type)}
                        size="small"
                        sx={{ 
                          fontWeight: 600,
                          boxShadow: 2
                        }}
                      />
                    </Box>
                  </Box>
                )}
                
                {/* Event type chip if no image */}
                {!selectedItem.imageUrl && (
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography color="textSecondary">
                      {selectedItem.isMultiDay ? (
                        <>
                          {formatDate(selectedItem.startDate || selectedItem.date)} - {formatDate(selectedItem.endDate || selectedItem.date)}
                        </>
                      ) : (
                        formatDate(selectedItem.date)
                      )}
                    </Typography>
                    <Chip
                      label={selectedItem.type.charAt(0).toUpperCase() + selectedItem.type.slice(1)}
                      color={getEventTypeColor(selectedItem.type)}
                      size="small"
                    />
                  </Box>
                )}
                
                {/* Description */}
                <Typography variant="body1" paragraph sx={{ whiteSpace: 'pre-line', mb: 4 }}>
                  {selectedItem.description}
                </Typography>
                
                {/* Event details */}
                <Paper elevation={0} sx={{ p: 3, bgcolor: 'background.paper', borderRadius: 2, mb: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
                    Event Details
                  </Typography>
                  
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <CalendarIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Date
                          </Typography>
                          <Typography variant="body2">
                            {selectedItem.isMultiDay ? (
                              <>
                                {formatDate(selectedItem.startDate || selectedItem.date)} - {formatDate(selectedItem.endDate || selectedItem.date)}
                              </>
                            ) : (
                              formatDate(selectedItem.date)
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                        <TimeIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Time
                          </Typography>
                          <Typography variant="body2">
                            {selectedItem.isMultiDay ? (
                              <>
                                {selectedItem.startTime || selectedItem.time} - {selectedItem.endTime || selectedItem.time}
                              </>
                            ) : (
                              selectedItem.time
                            )}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                    
                    <Grid item xs={12}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                        <LocationIcon sx={{ mr: 2, color: 'primary.main' }} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={600}>
                            Location
                          </Typography>
                          <Typography variant="body2">
                            {selectedItem.location}
                          </Typography>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </>
            )
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} variant="outlined">Close</Button>
          {selectedItem && 'type' in selectedItem && selectedItem.registrationUrl && (
            <Button 
              variant="contained" 
              color="primary"
              href={selectedItem.registrationUrl}
              target="_blank"
              rel="noopener noreferrer"
              startIcon={<ArrowForwardIcon />}
            >
              Register Now
            </Button>
          )}
          {selectedItem && 'type' in selectedItem && !selectedItem.registrationUrl && (
            <Button 
              variant="contained" 
              onClick={() => {
                handleCloseDialog();
                navigate(`/events/${selectedItem.id}`);
              }}
            >
              View Event Page
            </Button>
          )}
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Add Dialog */}
      {renderAddDialog()}
    </Box>
  );
};

export default NewsAndEvents; 