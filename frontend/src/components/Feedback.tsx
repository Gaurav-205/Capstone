import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Tabs,
  Tab,
  Grid,
  Paper,
  Button,
  TextField,
  MenuItem,
  Stepper,
  Step,
  StepLabel,
  Card,
  CardContent,
  CardActions,
  Chip,
  Rating,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from '@mui/material';
import {
  Send as SendIcon,
  Add as AddIcon,
  Timeline as TimelineIcon,
  Star as StarIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Check as CheckIcon,
} from '@mui/icons-material';
import FeedbackForm from './FeedbackForm';
import feedbackService, { Feedback as FeedbackType } from '../services/feedbackService';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

const Feedback = () => {
  const [tabValue, setTabValue] = useState(0);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackType | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isResolveDialogOpen, setIsResolveDialogOpen] = useState(false);
  const [resolutionDescription, setResolutionDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const loadFeedbackHistory = async () => {
    try {
      const feedback = await feedbackService.getUserFeedback();
      setFeedbackHistory(feedback);
    } catch (error) {
      console.error('Error loading feedback:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const feedback = await feedbackService.getUserFeedback();
        if (mounted) {
          setFeedbackHistory(feedback);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading feedback:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
      setFeedbackHistory([]);
      setSelectedFeedback(null);
      setIsDeleteDialogOpen(false);
      setIsResolveDialogOpen(false);
      setResolutionDescription('');
      setIsProcessing(false);
    };
  }, []);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setSelectedFeedback(null);
    setIsDeleteDialogOpen(false);
    setIsResolveDialogOpen(false);
    setResolutionDescription('');
    setIsProcessing(false);
    
    setTabValue(newValue);
  };

  const handleEdit = (feedback: FeedbackType) => {
    setSelectedFeedback(feedback);
    setTabValue(0); // Switch to the submit tab for editing
  };

  const handleDeleteClick = (feedback: FeedbackType) => {
    setSelectedFeedback(feedback);
    setIsDeleteDialogOpen(true);
  };

  const handleResolveClick = (feedback: FeedbackType) => {
    setSelectedFeedback(feedback);
    setIsResolveDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!selectedFeedback) return;

    setIsProcessing(true);
    try {
      await feedbackService.deleteFeedback(selectedFeedback._id);
      setFeedbackHistory(prev => prev.filter(f => f._id !== selectedFeedback._id));
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting feedback:', error);
    } finally {
      setIsProcessing(false);
      setSelectedFeedback(null);
    }
  };

  const handleResolve = async () => {
    if (!selectedFeedback || !resolutionDescription.trim()) return;

    setIsProcessing(true);
    try {
      const resolution = {
        description: resolutionDescription,
        resolvedBy: 'user', // This should be the current user's name or ID
        resolvedAt: new Date(),
      };

      const updatedFeedback = await feedbackService.submitResolution(selectedFeedback._id, resolution);
      setFeedbackHistory(prev => prev.map(f => 
        f._id === updatedFeedback._id ? updatedFeedback : f
      ));
      setIsResolveDialogOpen(false);
      setResolutionDescription('');
    } catch (error) {
      console.error('Error resolving feedback:', error);
    } finally {
      setIsProcessing(false);
      setSelectedFeedback(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  const getStepNumber = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 0;
      case 'in_progress':
        return 1;
      case 'resolved':
        return 2;
      case 'closed':
        return 3;
      default:
        return 0;
    }
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Feedback & Tracking
      </Typography>

      <Tabs 
        value={tabValue} 
        onChange={handleTabChange}
        sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 2,
        }}
      >
        <Tab 
          icon={<AddIcon />} 
          iconPosition="start" 
          label={selectedFeedback ? "EDIT FEEDBACK" : "SUBMIT FEEDBACK"}
        />
        <Tab 
          icon={<TimelineIcon />} 
          iconPosition="start" 
          label="TRACK STATUS" 
        />
      </Tabs>

      <TabPanel value={tabValue} index={0}>
        <FeedbackForm feedbackToEdit={selectedFeedback} onSubmitSuccess={() => {
          setSelectedFeedback(null);
          setTabValue(1);
          loadFeedbackHistory();
        }} />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {loading ? (
          <Box display="flex" justifyContent="center" p={4}>
            <CircularProgress />
          </Box>
        ) : feedbackHistory.length === 0 ? (
          <Box textAlign="center" p={4}>
            <Typography variant="h6" color="text.secondary">
              No feedback submitted yet
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {feedbackHistory.map((feedback) => (
              <Grid item xs={12} key={feedback._id}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box>
                        <Typography variant="h6" gutterBottom>
                          {feedback.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Chip 
                        label={feedback.status.toUpperCase().replace('_', ' ')}
                        color={getStatusColor(feedback.status)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body1" paragraph>
                      {feedback.description}
                    </Typography>

                    <Box mb={3}>
                      <Chip 
                        label={feedback.category}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <Chip 
                        label={feedback.type}
                        variant="outlined"
                        size="small"
                        sx={{ mr: 1 }}
                      />
                    </Box>

                    <Box sx={{ mt: 2, display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'flex-start' }}>
                      <Typography variant="body2" color="text.secondary">
                        Reference: {feedback.referenceNumber}
                      </Typography>
                      <Chip 
                        size="small" 
                        color={getStatusColor(feedback.status)}
                        label={`Status: ${feedback.status.replace('_', ' ')}`}
                      />
                    </Box>

                    <Stepper activeStep={getStepNumber(feedback.status)} alternativeLabel>
                      <Step>
                        <StepLabel>Submitted</StepLabel>
                      </Step>
                      <Step>
                        <StepLabel>In Progress</StepLabel>
                      </Step>
                      <Step>
                        <StepLabel>Resolved</StepLabel>
                      </Step>
                      <Step>
                        <StepLabel>Closed</StepLabel>
                      </Step>
                    </Stepper>

                    {feedback.resolution && (
                      <Box mt={2}>
                        <Typography variant="subtitle2" color="primary">
                          Resolution:
                        </Typography>
                        <Typography variant="body2">
                          {feedback.resolution.description}
                        </Typography>
                        {feedback.userRating && (
                          <Box mt={1} display="flex" alignItems="center">
                            <Typography variant="body2" mr={1}>
                              Your Rating:
                            </Typography>
                            <Rating value={feedback.userRating.rating} readOnly size="small" />
                          </Box>
                        )}
                      </Box>
                    )}
                  </CardContent>
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    {feedback.status !== 'resolved' && feedback.status !== 'closed' && (
                      <>
                        <Button
                          size="small"
                          startIcon={<EditIcon />}
                          onClick={() => handleEdit(feedback)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => handleDeleteClick(feedback)}
                        >
                          Delete
                        </Button>
                        <Button
                          size="small"
                          color="success"
                          startIcon={<CheckIcon />}
                          onClick={() => handleResolveClick(feedback)}
                        >
                          Mark as Resolved
                        </Button>
                      </>
                    )}
                  </CardActions>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </TabPanel>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Feedback</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this feedback? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            color="error"
            disabled={isProcessing}
            startIcon={isProcessing ? <CircularProgress size={20} /> : null}
          >
            {isProcessing ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Resolve Dialog */}
      <Dialog
        open={isResolveDialogOpen}
        onClose={() => setIsResolveDialogOpen(false)}
      >
        <DialogTitle>Mark as Resolved</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Please provide a resolution description:
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={resolutionDescription}
            onChange={(e) => setResolutionDescription(e.target.value)}
            placeholder="Describe how this feedback was resolved..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => {
              setIsResolveDialogOpen(false);
              setResolutionDescription('');
            }}
            disabled={isProcessing}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleResolve}
            color="success"
            disabled={isProcessing || !resolutionDescription.trim()}
            startIcon={isProcessing ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            {isProcessing ? 'Resolving...' : 'Resolve'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Feedback; 