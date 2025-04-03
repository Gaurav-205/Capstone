import React, { useState } from 'react';
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
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  ArrowForward as ArrowForwardIcon,
  Close as CloseIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  BookmarkBorder as BookmarkBorderIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';

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
}

const NewsAndEvents: React.FC<{ isAdmin?: boolean }> = ({ isAdmin = false }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [selectedItem, setSelectedItem] = useState<NewsItem | EventItem | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [addItemType, setAddItemType] = useState<'news' | 'event'>('news');
  const [formData, setFormData] = useState<AddItemFormData>({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
  });
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isDashboard = location.pathname === '/dashboard';

  // Simulate loading
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Sample data - replace with actual API calls
  const newsItems: NewsItem[] = [
    {
      id: '1',
      title: 'Campus Reopening Guidelines',
      content: 'Important updates about campus reopening and safety protocols...',
      date: '2024-03-20',
      category: 'Announcement',
      priority: 'high',
    },
    {
      id: '2',
      title: 'New Academic Programs',
      content: 'University introduces new programs for the upcoming semester...',
      date: '2024-03-19',
      category: 'Academic',
      priority: 'medium',
    },
  ];

  const events: EventItem[] = [
    {
      id: '1',
      title: 'Annual Sports Day',
      description: 'Join us for the annual sports competition...',
      date: '2024-04-15',
      time: '9:00 AM',
      location: 'University Stadium',
      type: 'sports',
    },
    {
      id: '2',
      title: 'Career Fair 2024',
      description: 'Meet top companies and explore job opportunities...',
      date: '2024-04-20',
      time: '10:00 AM',
      location: 'University Convention Center',
      type: 'academic',
    },
  ];

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

  const handleBookmark = (id: string) => {
    setBookmarkedItems(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(id)) {
        newBookmarks.delete(id);
        setSnackbar({ open: true, message: 'Removed from bookmarks' });
      } else {
        newBookmarks.add(id);
        setSnackbar({ open: true, message: 'Added to bookmarks' });
      }
      return newBookmarks;
    });
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
        setSnackbar({ open: true, message: 'Link copied to clipboard!' });
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const truncateText = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getPriorityColor = (priority: string): "error" | "warning" | "success" => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'success';
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
    setOpenAddDialog(true);
    setAddItemType(activeTab === 0 ? 'news' : 'event');
    setFormData({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
    });
  };

  const handleFormSubmit = async () => {
    try {
      // Here you would typically make an API call to save the new item
      console.log('Submitting:', { type: addItemType, data: formData });
      
      // Show success message
      setSnackbar({ open: true, message: `${addItemType === 'news' ? 'News' : 'Event'} added successfully` });
      
      // Close dialog
      setOpenAddDialog(false);
      
      // Reset form
      setFormData({
        title: '',
        content: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      console.error('Error adding item:', error);
      setSnackbar({ open: true, message: 'Error adding item. Please try again.' });
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
                          <Chip
                            label={news.priority}
                            color={getPriorityColor(news.priority)}
                            size="small"
                          />
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
                            sx={{ mr: 1 }}
                          >
                            <ShareIcon />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={() => handleBookmark(news.id)}
                          >
                            {bookmarkedItems.has(news.id) ? (
                              <BookmarkIcon color="primary" />
                            ) : (
                              <BookmarkBorderIcon />
                            )}
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
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flex: 1 }}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                          <Typography variant="h6" gutterBottom>
                            {event.title}
                          </Typography>
                          <Chip
                            label={event.type}
                            color={getEventTypeColor(event.type)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" paragraph>
                          {truncateText(event.description)}
                        </Typography>
                        <List dense>
                          <ListItem>
                            <ListItemIcon>
                              <CalendarIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Date" secondary={event.date} />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <TimeIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Time" secondary={event.time} />
                          </ListItem>
                          <ListItem>
                            <ListItemIcon>
                              <LocationIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary="Location" secondary={event.location} />
                          </ListItem>
                        </List>
                      </CardContent>
                      <CardActions sx={{ justifyContent: 'space-between' }}>
                        <Box>
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
                            sx={{ mr: 1 }}
                          >
                            <ShareIcon />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={() => handleBookmark(event.id)}
                          >
                            {bookmarkedItems.has(event.id) ? (
                              <BookmarkIcon color="primary" />
                            ) : (
                              <BookmarkBorderIcon />
                            )}
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
        maxWidth="sm"
        fullWidth
        TransitionComponent={Fade}
        transitionDuration={300}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
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
                  <IconButton 
                    size="small"
                    onClick={() => handleBookmark(selectedItem.id)}
                    sx={{ mr: 1 }}
                  >
                    {bookmarkedItems.has(selectedItem.id) ? (
                      <BookmarkIcon color="primary" />
                    ) : (
                      <BookmarkBorderIcon />
                    )}
                  </IconButton>
                </>
              )}
              <IconButton onClick={handleCloseDialog} size="small">
                <CloseIcon />
              </IconButton>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedItem && (
            'content' in selectedItem ? (
              // News content
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography color="textSecondary">
                    {(selectedItem as NewsItem).category} • {selectedItem.date}
                  </Typography>
                  <Chip
                    label={(selectedItem as NewsItem).priority}
                    color={getPriorityColor((selectedItem as NewsItem).priority)}
                    size="small"
                  />
                </Box>
                <Typography variant="body1">
                  {(selectedItem as NewsItem).content}
                </Typography>
              </>
            ) : (
              // Event content
              <>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography color="textSecondary">
                    {selectedItem.date}
                  </Typography>
                  <Chip
                    label={(selectedItem as EventItem).type}
                    color={getEventTypeColor((selectedItem as EventItem).type)}
                    size="small"
                  />
                </Box>
                <Typography variant="body1" paragraph>
                  {(selectedItem as EventItem).description}
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <CalendarIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Date & Time" 
                      secondary={`${selectedItem.date}, ${(selectedItem as EventItem).time}`} 
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Location" 
                      secondary={(selectedItem as EventItem).location} 
                    />
                  </ListItem>
                </List>
              </>
            )
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          {selectedItem && 'type' in selectedItem && (
            <Button 
              variant="contained" 
              onClick={() => {
                handleCloseDialog();
                navigate(`/events/${selectedItem.id}`);
              }}
            >
              Register for Event
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
          severity="success" 
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