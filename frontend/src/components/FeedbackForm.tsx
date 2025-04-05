import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import feedbackService, { CreateFeedbackData, Feedback as FeedbackType } from '../services/feedbackService';
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
  SelectChangeEvent,
  IconButton,
  ImageList,
  ImageListItem,
  Container,
  Paper,
  CircularProgress
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon, Send as SendIcon } from '@mui/icons-material';

interface AttachmentWithPreview extends File {
  preview?: string;
}

interface FeedbackFormProps {
  feedbackToEdit?: FeedbackType | null;
  onSubmitSuccess?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ feedbackToEdit, onSubmitSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateFeedbackData>({
    type: 'feedback',
    category: 'academic',
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

  // Initialize form with feedback data when editing
  useEffect(() => {
    if (feedbackToEdit) {
      setFormData({
        type: feedbackToEdit.type,
        category: feedbackToEdit.category,
        title: feedbackToEdit.title,
        description: feedbackToEdit.description,
        isAnonymous: feedbackToEdit.isAnonymous,
        priority: feedbackToEdit.priority,
        attachments: [] // Reset attachments when editing
      });
    }
  }, [feedbackToEdit]);

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
      let response;
      if (feedbackToEdit) {
        // Update existing feedback
        response = await feedbackService.updateFeedback(feedbackToEdit._id, formData);
        console.log('Feedback updated successfully:', response);
      } else {
        // Create new feedback
        response = await feedbackService.createFeedback(formData);
        console.log('Feedback created successfully:', response);
      }
      
      setSnackbar({
        open: true,
        message: `Feedback ${feedbackToEdit ? 'updated' : 'submitted'} successfully!`,
        severity: 'success'
      });
      
      // Clear form data
      setFormData({
        type: 'feedback',
        category: 'academic',
        title: '',
        description: '',
        isAnonymous: false,
        priority: 'medium',
        attachments: []
      });

      // Use the callback if provided, otherwise reload the page
      if (onSubmitSuccess) {
        setTimeout(onSubmitSuccess, 1500);
      } else {
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      }
    } catch (error: any) {
      console.error('Error with feedback:', error);
      
      const errorMessage = error.response?.data?.message 
        || error.response?.data?.error
        || error.message
        || `Failed to ${feedbackToEdit ? 'update' : 'submit'} feedback. Please try again.`;
      
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
          {feedbackToEdit ? 'Edit Feedback' : 'Submit Feedback'}
        </Typography>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Type</InputLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Type"
              required
            >
              <MenuItem value="feedback">Feedback</MenuItem>
              <MenuItem value="complaint">Complaint</MenuItem>
              <MenuItem value="suggestion">Suggestion</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth sx={{ mb: 2 }}>
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

          <FormControl fullWidth sx={{ mb: 2 }}>
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
            name="title"
            label="Title"
            value={formData.title}
            onChange={handleChange}
            required
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            name="description"
            label="Description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            required
            sx={{ mb: 2 }}
          />

          <FormControlLabel
            control={
              <Switch
                checked={formData.isAnonymous}
                onChange={handleSwitchChange}
                name="isAnonymous"
              />
            }
            label="Submit Anonymously"
            sx={{ mb: 2 }}
          />

          <Box sx={{ mb: 2 }}>
            <input
              accept="image/*,.pdf,.doc,.docx"
              style={{ display: 'none' }}
              id="attachment-button"
              type="file"
              multiple
              onChange={handleFileChange}
            />
            <label htmlFor="attachment-button">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUploadIcon />}
              >
                Attach Files
              </Button>
            </label>
          </Box>

          {formData.attachments.length > 0 && (
            <ImageList sx={{ width: '100%', height: 'auto', mb: 2 }} cols={3} rowHeight={164}>
              {formData.attachments.map((attachment, index) => (
                <ImageListItem key={index}>
                  {attachment.file.type.startsWith('image/') ? (
                    <img
                      src={(attachment.file as AttachmentWithPreview).preview}
                      alt={attachment.filename}
                      loading="lazy"
                      style={{ height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <Box
                      sx={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: 'grey.100',
                      }}
                    >
                      <Typography variant="body2">{attachment.filename}</Typography>
                    </Box>
                  )}
                  <IconButton
                    sx={{
                      position: 'absolute',
                      right: 8,
                      top: 8,
                      bgcolor: 'rgba(255, 255, 255, 0.7)',
                    }}
                    onClick={() => handleRemoveAttachment(index)}
                  >
                    <CloseIcon />
                  </IconButton>
                </ImageListItem>
              ))}
            </ImageList>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isSubmitting}
            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
            fullWidth
          >
            {isSubmitting 
              ? 'Submitting...' 
              : feedbackToEdit 
                ? 'Update Feedback' 
                : 'Submit Feedback'
            }
          </Button>
        </form>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity={snackbar.severity}
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