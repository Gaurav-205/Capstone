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
  InputAdornment,
  Stack,
  Divider
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
  }, [feedback, searchTerm, statusFilter, categoryFilter]);

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

  // Get unique categories from feedback using filter+indexOf
  const categories = feedback
    .map(item => item.category)
    .filter((category, index, array) => array.indexOf(category) === index);

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

        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search by keyword or reference number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl size="small" fullWidth>
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
                
                <FormControl size="small" fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="all">All Categories</MenuItem>
                    {categories.map((category) => (
                      <MenuItem key={category} value={category}>
                        {category}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
            </Grid>
          </Grid>
        </Paper>

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
              <Grid item xs={12} sm={6} md={4} key={item._id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom noWrap>
                      {item.title}
                    </Typography>
                    
                    <Box sx={{ mb: 2 }}>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip 
                          label={item.type}
                          size="small"
                          color="primary"
                        />
                        <Chip 
                          label={item.category}
                          size="small"
                          variant="outlined"
                        />
                        <Chip 
                          label={item.status.replace('_', ' ')}
                          size="small"
                          color={getStatusColor(item.status)}
                        />
                      </Stack>
                    </Box>
                    
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {item.description.length > 120 
                        ? `${item.description.substring(0, 120)}...` 
                        : item.description
                      }
                    </Typography>
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Stack spacing={0.5} sx={{ mt: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Reference:</strong> {item.referenceNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        <strong>Submitted:</strong> {new Date(item.createdAt).toLocaleDateString()}
                      </Typography>
                      
                      {item.resolution && (
                        <Box mt={1}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Resolution:</strong> {item.resolution.description.substring(0, 60)}
                            {item.resolution.description.length > 60 ? '...' : ''}
                          </Typography>
                        </Box>
                      )}
                    </Stack>
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