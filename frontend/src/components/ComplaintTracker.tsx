import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import feedbackService, { Feedback } from '../services/feedbackService';
import { 
  Snackbar, 
  Alert, 
  Button, 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Chip,
  Grid,
  IconButton,
  Tooltip,
  LinearProgress,
  Container,
  Paper,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment
} from '@mui/material';
import { 
  Add as AddIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon
} from '@mui/icons-material';

const ComplaintTracker: React.FC = () => {
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [filteredFeedback, setFilteredFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  useEffect(() => {
    fetchFeedback();
  }, []);

  useEffect(() => {
    filterFeedback();
  }, [feedback, searchTerm, statusFilter, priorityFilter, categoryFilter]);

  const fetchFeedback = async () => {
    try {
      setIsLoading(true);
      const data = await feedbackService.getUserFeedback();
      setFeedback(data);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to fetch feedback history',
        severity: 'error'
      });
      console.error('Error fetching feedback:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterFeedback = () => {
    let filtered = feedback.filter(item => item.type === 'complaint');

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.referenceNumber.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(item => item.status === statusFilter);
    }

    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(item => item.priority === priorityFilter);
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    setFilteredFeedback(filtered);
  };

  const getStatusColor = (status: Feedback['status']) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'in_progress':
        return 'info';
      case 'resolved':
        return 'success';
      case 'closed':
        return 'default';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority: Feedback['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'error';
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

  const handleDownloadAttachment = (url: string, filename: string) => {
    window.open(url, '_blank');
  };

  const handleRateResolution = async (id: string, rating: number) => {
    try {
      await feedbackService.rateResolution(id, { rating, comment: '' });
      fetchFeedback(); // Refresh the list
      setSnackbar({
        open: true,
        message: 'Rating submitted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to submit rating',
        severity: 'error'
      });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const LoadingSkeleton = () => (
    <Grid container spacing={3}>
      {[1, 2, 3].map((item) => (
        <Grid item xs={12} key={item}>
          <Card>
            <CardContent>
              <Skeleton variant="text" height={32} width="60%" />
              <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                <Skeleton variant="rectangular" height={24} width={100} />
              </Box>
              <Skeleton variant="text" height={24} />
              <Skeleton variant="text" height={24} width="80%" />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h2">
            Complaint Tracker
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchFeedback}
              disabled={isLoading}
            >
              Refresh
            </Button>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              component={Link}
              to="/feedback/new"
            >
              Submit New Complaint
            </Button>
          </Box>
        </Box>

        <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search complaints..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ flex: 1, minWidth: 200 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Status"
            >
              <MenuItem value="all">All Statuses</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="in_progress">In Progress</MenuItem>
              <MenuItem value="resolved">Resolved</MenuItem>
              <MenuItem value="closed">Closed</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Priority</InputLabel>
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              label="Priority"
            >
              <MenuItem value="all">All Priorities</MenuItem>
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              label="Category"
            >
              <MenuItem value="all">All Categories</MenuItem>
              <MenuItem value="academic">Academic</MenuItem>
              <MenuItem value="facilities">Facilities</MenuItem>
              <MenuItem value="harassment">Harassment</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {isLoading ? (
          <LoadingSkeleton />
        ) : filteredFeedback.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary" align="center">
                No complaints found. Click the button above to submit a new complaint.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {filteredFeedback.map((item) => (
              <Grid item xs={12} key={item._id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {item.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            label={item.category} 
                            size="small" 
                            color="secondary"
                          />
                          <Chip 
                            label={item.status.replace('_', ' ')} 
                            size="small" 
                            color={getStatusColor(item.status)}
                          />
                          <Chip 
                            label={item.priority} 
                            size="small" 
                            color={getPriorityColor(item.priority)}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Reference: {item.referenceNumber}
                        </Typography>
                      </Box>
                      {item.status === 'resolved' && !item.userRating && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <Tooltip key={rating} title={`Rate ${rating} stars`}>
                              <IconButton
                                size="small"
                                onClick={() => handleRateResolution(item._id, rating)}
                              >
                                <StarBorderIcon />
                              </IconButton>
                            </Tooltip>
                          ))}
                        </Box>
                      )}
                    </Box>

                    <Typography variant="body1" paragraph>
                      {item.description}
                    </Typography>

                    {item.attachments && item.attachments.length > 0 && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Attachments:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {item.attachments.map((attachment, index) => (
                            <Button
                              key={index}
                              size="small"
                              startIcon={<DownloadIcon />}
                              onClick={() => handleDownloadAttachment(attachment.url, attachment.filename)}
                              variant="outlined"
                            >
                              {attachment.filename}
                            </Button>
                          ))}
                        </Box>
                      </Box>
                    )}

                    {item.resolution && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Resolution:
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {item.resolution.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Resolved on {new Date(item.resolution.resolvedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}

                    {item.userRating && (
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="subtitle2">Your Rating:</Typography>
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <StarIcon
                            key={rating}
                            color={rating <= item.userRating!.rating ? 'primary' : 'disabled'}
                          />
                        ))}
                      </Box>
                    )}

                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Submitted on {new Date(item.createdAt).toLocaleDateString()}
                      </Typography>
                      {item.expectedResolutionDate && (
                        <Typography variant="caption" color="text.secondary">
                          Expected resolution: {new Date(item.expectedResolutionDate).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ComplaintTracker; 