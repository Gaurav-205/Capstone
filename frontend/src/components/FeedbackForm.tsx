import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import feedbackService, { CreateFeedbackData } from '../services/feedbackService';
import { 
  Snackbar, 
  Alert, 
  TextField, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  FormControlLabel, 
  Switch, 
  Button, 
  Box, 
  Typography, 
  LinearProgress,
  SelectChangeEvent,
  IconButton,
  ImageList,
  ImageListItem,
  Container,
  Paper
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';

interface AttachmentWithPreview extends File {
  preview?: string;
}

const FeedbackForm: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateFeedbackData>({
    type: 'feedback',
    category: 'other',
    title: '',
    description: '',
    isAnonymous: false,
    priority: 'medium',
    attachments: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Clean up previews when component unmounts
  useEffect(() => {
    return () => {
      formData.attachments.forEach(attachment => {
        if ('preview' in attachment.file) {
          URL.revokeObjectURL((attachment.file as AttachmentWithPreview).preview || '');
        }
      });
    };
  }, [formData.attachments]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      isAnonymous: e.target.checked
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments = Array.from(files).map(file => {
      const preview = file.type.startsWith('image/') 
        ? URL.createObjectURL(file) 
        : undefined;
      
      return {
        file: Object.assign(file, { preview }),
        filename: file.name,
        mimetype: file.type
      };
    });

    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => {
      const attachment = prev.attachments[index];
      if ('preview' in attachment.file) {
        URL.revokeObjectURL((attachment.file as AttachmentWithPreview).preview || '');
      }
      return {
        ...prev,
        attachments: prev.attachments.filter((_, i) => i !== index)
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.title.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a title',
        severity: 'error'
      });
      return;
    }

    if (!formData.description.trim()) {
      setSnackbar({
        open: true,
        message: 'Please enter a description',
        severity: 'error'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await feedbackService.createFeedback(formData);
      console.log('Feedback submitted successfully:', response);
      
      setSnackbar({
        open: true,
        message: 'Feedback submitted successfully!',
        severity: 'success'
      });
      
      // Clear form data
      setFormData({
        type: 'feedback',
        category: 'other',
        title: '',
        description: '',
        isAnonymous: false,
        priority: 'medium',
        attachments: []
      });

      // Navigate after a short delay
      setTimeout(() => {
        navigate('/feedback');
      }, 1500);
    } catch (error: any) {
      console.error('Error submitting feedback:', error);
      
      // Extract error message from the response
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || error.message
        || 'Failed to submit feedback. Please try again.';
      
      setSnackbar({
        open: true,
        message: errorMessage,
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Submit Feedback
        </Typography>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Type"
              required
            >
              <MenuItem value="feedback">General Feedback</MenuItem>
              <MenuItem value="complaint">Complaint</MenuItem>
              <MenuItem value="suggestion">Suggestion</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={formData.category}
              onChange={handleChange}
              label="Category"
              required
            >
              <MenuItem value="academic">Academic</MenuItem>
              <MenuItem value="facilities">Facilities</MenuItem>
              <MenuItem value="harassment">Harassment</MenuItem>
              <MenuItem value="other">Other</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              label="Priority"
              required
            >
              <MenuItem value="low">Low</MenuItem>
              <MenuItem value="medium">Medium</MenuItem>
              <MenuItem value="high">High</MenuItem>
              <MenuItem value="urgent">Urgent</MenuItem>
            </Select>
          </FormControl>

          <TextField
            fullWidth
            required
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            error={formData.title.trim() === ''}
            helperText={formData.title.trim() === '' ? 'Title is required' : ''}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            required
            multiline
            rows={4}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={formData.description.trim() === ''}
            helperText={formData.description.trim() === '' ? 'Description is required' : ''}
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                name="isAnonymous"
                checked={formData.isAnonymous}
                onChange={handleSwitchChange}
              />
            }
            label="Submit Anonymously"
          />

          <Box sx={{ mb: 3 }}>
            <input
              accept="image/*,.pdf,.doc,.docx"
              style={{ display: 'none' }}
              id="file-upload"
              multiple
              type="file"
              onChange={handleFileChange}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
                fullWidth
                sx={{ mb: 2 }}
              >
                Upload Attachments
              </Button>
            </label>
            {formData.attachments.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Attachments:
                </Typography>
                <ImageList cols={3} rowHeight={164} sx={{ mb: 2 }}>
                  {formData.attachments.map((attachment, index) => {
                    const preview = (attachment.file as AttachmentWithPreview).preview;
                    if (preview && attachment.mimetype.startsWith('image/')) {
                      return (
                        <ImageListItem key={index}>
                          <img
                            src={preview}
                            alt={attachment.filename}
                            loading="lazy"
                            style={{ height: '164px', objectFit: 'cover' }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveAttachment(index)}
                            sx={{
                              position: 'absolute',
                              right: 4,
                              top: 4,
                              bgcolor: 'rgba(255, 255, 255, 0.8)',
                              '&:hover': {
                                bgcolor: 'rgba(255, 255, 255, 0.9)',
                              },
                            }}
                          >
                            <CloseIcon />
                          </IconButton>
                        </ImageListItem>
                      );
                    }
                    return (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          p: 1,
                          bgcolor: 'grey.100',
                          borderRadius: 1,
                          mb: 1
                        }}
                      >
                        <Typography variant="body2" noWrap sx={{ flex: 1, mr: 1 }}>
                          {attachment.filename}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveAttachment(index)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    );
                  })}
                </ImageList>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
            <Button
              variant="outlined"
              color="secondary"
              fullWidth
              onClick={() => navigate('/feedback')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              disabled={isSubmitting}
              sx={{ py: 1.5 }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </Box>
        </form>

        {isSubmitting && (
          <Box sx={{ width: '100%', mt: 2 }}>
            <LinearProgress />
          </Box>
        )}

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={6000} 
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert 
            onClose={handleCloseSnackbar} 
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default FeedbackForm; 