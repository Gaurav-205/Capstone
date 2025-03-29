import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import feedbackService, { Feedback } from '../services/feedbackService';
import { API_URL } from '../config';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  ImageList,
  ImageListItem
} from '@mui/material';
import { 
  Add as AddIcon,
  Download as DownloadIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon,
  Refresh as RefreshIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Image as ImageIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

const FeedbackList: React.FC = () => {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] = useState<string | null>(null);
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

  const handleDeleteClick = (id: string) => {
    setFeedbackToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!feedbackToDelete) return;

    try {
      await feedbackService.deleteFeedback(feedbackToDelete);
      setFeedback(feedback.filter(item => item._id !== feedbackToDelete));
      setSnackbar({
        open: true,
        message: 'Feedback deleted successfully',
        severity: 'success'
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to delete feedback',
        severity: 'error'
      });
    } finally {
      setDeleteDialogOpen(false);
      setFeedbackToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setFeedbackToDelete(null);
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

  const getFullImageUrl = (url: string) => {
    // If it's already a full URL, return as is
    if (url.startsWith('http')) return url;
    
    // Remove any leading slashes
    const cleanUrl = url.startsWith('/') ? url.substring(1) : url;
    
    // Extract the filename from the path
    const filename = cleanUrl.split('/').pop() || cleanUrl;
    
    // Construct the full URL without the api prefix
    const fullUrl = `${API_URL}/uploads/${filename}`;
    console.log('Original URL:', url);
    console.log('Clean URL:', cleanUrl);
    console.log('Filename:', filename);
    console.log('Full URL:', fullUrl);
    return fullUrl;
  };

  const handleDownloadAttachment = async (url: string, filename: string) => {
    try {
      const fullUrl = getFullImageUrl(url);
      console.log('Attempting to download from:', fullUrl);
      const response = await fetch(fullUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Error downloading file:', error);
      console.error('URL attempted:', url);
      console.error('Full URL attempted:', getFullImageUrl(url));
      setSnackbar({
        open: true,
        message: 'Failed to download file. Please try again.',
        severity: 'error'
      });
    }
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
            Your Feedback History
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
              Submit New Feedback
            </Button>
          </Box>
        </Box>

        {isLoading ? (
          <LoadingSkeleton />
        ) : feedback.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body1" color="text.secondary" align="center">
                No feedback submitted yet. Click the button above to submit your first feedback.
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {feedback.map((item) => (
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
                            label={(item.type || 'Unknown').charAt(0).toUpperCase() + (item.type || 'Unknown').slice(1)} 
                            size="small" 
                            color="primary"
                          />
                          <Chip 
                            label={item.category || 'Uncategorized'} 
                            size="small" 
                            color="secondary"
                          />
                          <Chip 
                            label={(item.status || 'unknown').replace('_', ' ')} 
                            size="small" 
                            color={getStatusColor(item.status)}
                          />
                          <Chip 
                            label={item.priority || 'low'} 
                            size="small" 
                            color={getPriorityColor(item.priority)}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          Reference: {item.referenceNumber}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Edit">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/feedback/edit/${item._id}`)}
                            color="primary"
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteClick(item._id)}
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>

                    <Typography variant="body1" paragraph>
                      {item.description}
                    </Typography>

                    {item.resolution && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Resolution:
                        </Typography>
                        <Typography variant="body2" paragraph>
                          {item.resolution.description}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Resolved by: {item.resolution.resolvedBy}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Date: {new Date(item.resolution.resolvedAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    )}

                    {item.resolution && !item.userRating && (
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="subtitle2" gutterBottom>
                          Rate this resolution:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <IconButton
                              key={rating}
                              size="small"
                              onClick={() => handleRateResolution(item._id, rating)}
                            >
                              {rating <= (item.userRating?.rating || 0) ? (
                                <StarIcon color="primary" />
                              ) : (
                                <StarBorderIcon />
                              )}
                            </IconButton>
                          ))}
                        </Box>
                      </Box>
                    )}
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

      <Dialog
        open={deleteDialogOpen}
        onClose={handleDeleteCancel}
      >
        <DialogTitle>Delete Feedback</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this feedback? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default FeedbackList; 