import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  Alert,
  Snackbar,
  Tooltip,
  CircularProgress,
  Divider,
  Card,
  CardContent,
  CardMedia,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
  Visibility as VisibilityIcon,
  PhotoCamera as PhotoIcon,
} from '@mui/icons-material';
import EventRegistrationButton from '../../components/EventRegistrationButton';
import eventService, { Event } from '../../services/eventService';
import dayjs from 'dayjs';

const EventManagement: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState<Omit<Event, '_id' | 'createdAt' | 'updatedAt'>>({
    title: '',
    description: '',
    date: dayjs().format('YYYY-MM-DD'),
    time: '12:00',
    location: '',
    type: 'other',
    registrationUrl: '',
    isMultiDay: false,
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().format('YYYY-MM-DD'),
    startTime: '12:00',
    endTime: '13:00',
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error',
  });
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [imageUploadLoading, setImageUploadLoading] = useState(false);

  // Fetch events on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Fetch events from API
  const fetchEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getEvents();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setSnackbar({
        open: true,
        message: 'Failed to fetch events',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Open dialog to add new event
  const handleAddEvent = () => {
    setSelectedEvent(null);
    setNewEvent({
      title: '',
      description: '',
      date: dayjs().format('YYYY-MM-DD'),
      time: '12:00',
      location: '',
      type: 'other',
      registrationUrl: '',
      isMultiDay: false,
      startDate: dayjs().format('YYYY-MM-DD'),
      endDate: dayjs().format('YYYY-MM-DD'),
      startTime: '12:00',
      endTime: '13:00',
    });
    setOpenDialog(true);
  };

  // Open dialog to edit event
  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time,
      location: event.location,
      type: event.type,
      imageUrl: event.imageUrl,
      registrationUrl: event.registrationUrl,
      isMultiDay: event.isMultiDay,
      startDate: event.startDate,
      endDate: event.endDate,
      startTime: event.startTime,
      endTime: event.endTime,
    });
    setOpenDialog(true);
  };

  // Open dialog to confirm event deletion
  const handleDeleteEvent = (event: Event) => {
    setSelectedEvent(event);
    setOpenDeleteDialog(true);
  };

  // Handle input change for new/edited event
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEvent({
      ...newEvent,
      [name]: value,
    });
  };

  // Handle select change for event type
  const handleSelectChange = (e: React.ChangeEvent<{ name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    if (name) {
      setNewEvent({
        ...newEvent,
        [name]: value,
      });
    }
  };

  // Handle date change
  const handleDateChange = (date: any | null) => {
    if (date) {
      setNewEvent({
        ...newEvent,
        date: date.format('YYYY-MM-DD'),
      });
    }
  };

  // Handle time change
  const handleTimeChange = (time: any | null) => {
    if (time) {
      setNewEvent({
        ...newEvent,
        time: time.format('HH:mm'),
      });
    }
  };

  // Mock image upload functionality
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploadLoading(true);
    
    // TODO: Replace with actual API call to upload image
    // For now, just use a local URL for preview
    setTimeout(() => {
      const imageUrl = URL.createObjectURL(file);
      setNewEvent({
        ...newEvent,
        imageUrl,
      });
      setImageUploadLoading(false);
      
      setSnackbar({
        open: true,
        message: 'Image uploaded successfully (Note: This is a temporary preview)',
        severity: 'success',
      });
    }, 1000);
  };

  // Save new or edited event
  const handleSaveEvent = async () => {
    try {
      // If it's not a multi-day event, sync the fields
      const eventData = { ...newEvent };
      
      if (!eventData.isMultiDay) {
        // For single-day events, use the main date/time for all fields
        eventData.startDate = eventData.date;
        eventData.endDate = eventData.date;
        eventData.startTime = eventData.time;
        eventData.endTime = eventData.time;
      } else {
        // For multi-day events, ensure the main date/time is set to the start date/time
        eventData.date = eventData.startDate || eventData.date;
        eventData.time = eventData.startTime || eventData.time;
      }
      
      if (selectedEvent) {
        // Update existing event
        await eventService.updateEvent(selectedEvent._id, eventData);
        setSnackbar({
          open: true,
          message: 'Event updated successfully',
          severity: 'success',
        });
      } else {
        // Create new event
        await eventService.createEvent(eventData);
        setSnackbar({
          open: true,
          message: 'Event created successfully',
          severity: 'success',
        });
      }
      setOpenDialog(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      setSnackbar({
        open: true,
        message: 'Failed to save event',
        severity: 'error',
      });
    }
  };

  // Delete event
  const handleConfirmDelete = async () => {
    if (!selectedEvent) return;
    try {
      await eventService.deleteEvent(selectedEvent._id);
      setOpenDeleteDialog(false);
      setSnackbar({
        open: true,
        message: 'Event deleted successfully',
        severity: 'success',
      });
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete event',
        severity: 'error',
      });
    }
  };

  // Filter events by type and search term
  const filteredEvents = events.filter(
    (event) =>
      (filterType === 'all' || event.type === filterType) &&
      (event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Get color for event type
  const getEventTypeColor = (type: string): "primary" | "secondary" | "success" | "warning" | "error" => {
    switch (type) {
      case 'academic': return 'primary';
      case 'social': return 'secondary';
      case 'sports': return 'success';
      case 'cultural': return 'warning';
      default: return 'error';
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Event Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleAddEvent}
          sx={{ 
            borderRadius: '8px',
            boxShadow: 2,
            textTransform: 'none'
          }}
        >
          Add New Event
        </Button>
      </Box>

      {/* Filters and View Toggle */}
      <Paper sx={{ p: 2, mb: 3, borderRadius: '10px' }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Search Events"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth size="small">
              <InputLabel>Event Type</InputLabel>
              <Select
                value={filterType}
                label="Event Type"
                onChange={(e) => setFilterType(e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="academic">Academic</MenuItem>
                <MenuItem value="social">Social</MenuItem>
                <MenuItem value="sports">Sports</MenuItem>
                <MenuItem value="cultural">Cultural</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant={viewMode === 'table' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('table')}
              sx={{ mr: 1 }}
            >
              Table
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setViewMode('grid')}
            >
              Grid
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Loading Indicator */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Table View */}
          {viewMode === 'table' && (
            <TableContainer component={Paper} sx={{ borderRadius: '10px', boxShadow: 2 }}>
              <Table>
                <TableHead sx={{ backgroundColor: 'background.default' }}>
                  <TableRow>
                    <TableCell><Typography fontWeight={600}>Title</Typography></TableCell>
                    <TableCell><Typography fontWeight={600}>Type</Typography></TableCell>
                    <TableCell><Typography fontWeight={600}>Date & Time</Typography></TableCell>
                    <TableCell><Typography fontWeight={600}>Location</Typography></TableCell>
                    <TableCell><Typography fontWeight={600}>Registration</Typography></TableCell>
                    <TableCell><Typography fontWeight={600}>Created</Typography></TableCell>
                    <TableCell align="right"><Typography fontWeight={600}>Actions</Typography></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEvents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((event) => (
                    <TableRow key={event._id} hover>
                      <TableCell>
                        <Typography fontWeight={500}>{event.title}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={event.type.charAt(0).toUpperCase() + event.type.slice(1)} 
                          color={getEventTypeColor(event.type)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {event.isMultiDay ? (
                              <>
                                {formatDate(event.startDate || event.date)} - {formatDate(event.endDate || event.date)}
                              </>
                            ) : (
                              formatDate(event.date)
                            )}
                          </Typography>
                          <TimeIcon fontSize="small" color="action" sx={{ ml: 1 }} />
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
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <LocationIcon fontSize="small" color="action" />
                          <Typography variant="body2">{event.location}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {event.registrationUrl ? (
                          <Chip 
                            label="Available" 
                            color="success"
                            size="small"
                          />
                        ) : (
                          <Chip 
                            label="None" 
                            color="default"
                            size="small"
                            variant="outlined"
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{formatDate(event.createdAt)}</Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          <Tooltip title="View">
                            <IconButton size="small" color="primary">
                              <VisibilityIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit">
                            <IconButton size="small" color="primary" onClick={() => handleEditEvent(event)}>
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton size="small" color="error" onClick={() => handleDeleteEvent(event)}>
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredEvents.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
              />
            </TableContainer>
          )}

          {/* Grid View */}
          {viewMode === 'grid' && (
            <>
              <Grid container spacing={3}>
                {filteredEvents.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((event) => (
                  <Grid item xs={12} sm={6} md={4} key={event._id}>
                    <Card sx={{ 
                      height: '100%', 
                      display: 'flex', 
                      flexDirection: 'column',
                      borderRadius: '10px',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
                      }
                    }}>
                      <CardMedia
                        component="img"
                        height="160"
                        image={event.imageUrl || `https://source.unsplash.com/random/800x600/?${event.type}`}
                        alt={event.title}
                      />
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                          <Typography variant="h6" fontWeight={600}>{event.title}</Typography>
                          <Chip 
                            label={event.type.charAt(0).toUpperCase() + event.type.slice(1)} 
                            color={getEventTypeColor(event.type)}
                            size="small"
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ 
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
                          <TimeIcon fontSize="small" sx={{ ml: 2, mr: 1, color: 'text.secondary' }} />
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
                            <EventRegistrationButton
                              registrationUrl={event.registrationUrl}
                              buttonProps={{
                                size: "small",
                                variant: "outlined"
                              }}
                              label="Registration Link"
                            />
                          </Box>
                        )}
                      </CardContent>
                      <Divider />
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
                        <Tooltip title="View">
                          <IconButton size="small" color="primary">
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="primary" onClick={() => handleEditEvent(event)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton size="small" color="error" onClick={() => handleDeleteEvent(event)}>
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Card>
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                <TablePagination
                  rowsPerPageOptions={[6, 12, 24]}
                  component="div"
                  count={filteredEvents.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                  onRowsPerPageChange={handleChangeRowsPerPage}
                />
              </Box>
            </>
          )}
        </>
      )}

      {/* Add/Edit Event Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {selectedEvent ? 'Edit Event' : 'Add New Event'}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="title"
                label="Event Title"
                variant="outlined"
                value={newEvent.title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Event Date"
                  value={dayjs(newEvent.date)}
                  onChange={handleDateChange}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <TimePicker
                  label="Event Time"
                  value={dayjs(`2000-01-01T${newEvent.time}`)}
                  onChange={handleTimeChange}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </LocalizationProvider>
            </Grid>
            
            {/* Multi-day event controls */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FormControl component="fieldset">
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <input
                      type="checkbox" 
                      id="isMultiDay"
                      checked={newEvent.isMultiDay}
                      onChange={(e) => setNewEvent({
                        ...newEvent,
                        isMultiDay: e.target.checked
                      })}
                      style={{ marginRight: 8 }}
                    />
                    <Typography component="label" htmlFor="isMultiDay">
                      This is a multi-day event
                    </Typography>
                  </Box>
                </FormControl>
              </Box>
            </Grid>

            {newEvent.isMultiDay && (
              <>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Start Date"
                      value={dayjs(newEvent.startDate)}
                      onChange={(date) => {
                        if (date) {
                          setNewEvent({
                            ...newEvent,
                            startDate: date.format('YYYY-MM-DD')
                          });
                        }
                      }}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="End Date"
                      value={dayjs(newEvent.endDate)}
                      onChange={(date) => {
                        if (date) {
                          setNewEvent({
                            ...newEvent,
                            endDate: date.format('YYYY-MM-DD')
                          });
                        }
                      }}
                      slotProps={{ 
                        textField: { 
                          fullWidth: true,
                          helperText: "Must be same as or after start date" 
                        } 
                      }}
                      minDate={dayjs(newEvent.startDate)}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="Start Time"
                      value={dayjs(`2000-01-01T${newEvent.startTime}`)}
                      onChange={(time) => {
                        if (time) {
                          setNewEvent({
                            ...newEvent,
                            startTime: time.format('HH:mm')
                          });
                        }
                      }}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <TimePicker
                      label="End Time"
                      value={dayjs(`2000-01-01T${newEvent.endTime}`)}
                      onChange={(time) => {
                        if (time) {
                          setNewEvent({
                            ...newEvent,
                            endTime: time.format('HH:mm')
                          });
                        }
                      }}
                      slotProps={{ textField: { fullWidth: true } }}
                    />
                  </LocalizationProvider>
                </Grid>
              </>
            )}

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                name="location"
                label="Event Location"
                variant="outlined"
                value={newEvent.location}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Event Type</InputLabel>
                <Select
                  name="type"
                  value={newEvent.type}
                  label="Event Type"
                  onChange={handleSelectChange as any}
                  required
                >
                  <MenuItem value="academic">Academic</MenuItem>
                  <MenuItem value="social">Social</MenuItem>
                  <MenuItem value="sports">Sports</MenuItem>
                  <MenuItem value="cultural">Cultural</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="registrationUrl"
                label="Registration URL"
                variant="outlined"
                value={newEvent.registrationUrl || ''}
                onChange={handleInputChange}
                placeholder="https://example.com/register"
                helperText="URL where users can register for this event (optional)"
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                name="description"
                label="Event Description"
                variant="outlined"
                multiline
                rows={4}
                value={newEvent.description}
                onChange={handleInputChange}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<PhotoIcon />}
                  disabled={imageUploadLoading}
                >
                  Upload Image
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </Button>
                {imageUploadLoading && <CircularProgress size={24} />}
                {newEvent.imageUrl && (
                  <Box sx={{ ml: 2, position: 'relative' }}>
                    <img 
                      src={newEvent.imageUrl} 
                      alt="Preview" 
                      style={{ maxWidth: '100px', maxHeight: '60px', borderRadius: '4px' }} 
                    />
                    <IconButton 
                      size="small" 
                      sx={{ position: 'absolute', top: -10, right: -10, bgcolor: 'background.paper' }}
                      onClick={() => setNewEvent({ ...newEvent, imageUrl: undefined })}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSaveEvent}
            disabled={!newEvent.title || !newEvent.date || !newEvent.location || !newEvent.description}
          >
            {selectedEvent ? 'Update Event' : 'Create Event'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the event "{selectedEvent?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EventManagement; 