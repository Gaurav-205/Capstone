import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import feedbackService, { Feedback, UpdateFeedbackData } from '../services/feedbackService';
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
  Paper,
  Container,
  IconButton,
  ImageList,
  ImageListItem
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';

interface AttachmentWithPreview extends File {
  preview?: string;
}

const EditFeedback: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<UpdateFeedbackData>({
    type: 'feedback',
    category: 'other',
    title: '',
    description: '',
    isAnonymous: false,
    priority: 'medium',
    attachments: []
  });
  const [existingAttachments, setExistingAttachments] = useState<Feedback['attachments']>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
    const fetchFeedback = async () => {
      try {
        if (!id) return;
        const feedback = await feedbackService.getFeedbackById(id);
        setFormData({
          type: feedback.type,
          category: feedback.category,
          title: feedback.title,
          description: feedback.description,
          isAnonymous: feedback.isAnonymous,
          priority: feedback.priority
        });
        setExistingAttachments(feedback.attachments);
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to load feedback',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeedback();
  }, [id]);

  // Clean up previews when component unmounts
  React.useEffect(() => {
    return () => {
      if (formData.attachments) {
        formData.attachments.forEach(attachment => {
          if ('preview' in attachment.file) {
            URL.revokeObjectURL((attachment.file as AttachmentWithPreview).preview || '');
          }
        });
      }
    };
  }, []);

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
      attachments: [...(prev.attachments || []), ...newAttachments]
    }));
  };

  const handleRemoveAttachment = (index: number) => {
    setFormData(prev => {
      if (!prev.attachments) return prev;
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

  const handleRemoveExistingAttachment = (index: number) => {
    setExistingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!id) return;
      await feedbackService.updateFeedback(id, formData);
      setSnackbar({
        open: true,
        message: 'Feedback updated successfully!',
        severity: 'success'
      });
      setTimeout(() => {
        navigate('/feedback');
      }, 1500);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to update feedback. Please try again.',
        severity: 'error'
      });
      console.error('Error updating feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <LinearProgress sx={{ width: '100%' }} />
      </Box>
    );
  }

  return (
    <Container maxWidth="md">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Edit Feedback
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
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            variant="outlined"
          />

          <TextField
            fullWidth
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={4}
            required
            variant="outlined"
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
            {existingAttachments.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Existing Attachments:
                </Typography>
                <ImageList cols={3} rowHeight={164} sx={{ mb: 2 }}>
                  {existingAttachments.map((attachment, index) => {
                    if (attachment.mimetype.startsWith('image/')) {
                      return (
                        <ImageListItem key={index}>
                          <img
                            src={attachment.url}
                            alt={attachment.filename}
                            loading="lazy"
                            style={{ height: '164px', objectFit: 'cover' }}
                          />
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveExistingAttachment(index)}
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
                          onClick={() => handleRemoveExistingAttachment(index)}
                        >
                          <CloseIcon />
                        </IconButton>
                      </Box>
                    );
                  })}
                </ImageList>
              </Box>
            )}

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
                Upload New Attachments
              </Button>
            </label>
            {formData.attachments && formData.attachments.length > 0 && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  New Attachments:
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
            >
              {isSubmitting ? 'Updating...' : 'Update Feedback'}
            </Button>
          </Box>
          {isSubmitting && <LinearProgress sx={{ mt: 2 }} />}
        </form>
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

export default EditFeedback; 