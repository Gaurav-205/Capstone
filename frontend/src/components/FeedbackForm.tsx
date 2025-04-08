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
  ImageList,
  ImageListItem,
  Container,
  Paper,
  CircularProgress,
  Grid,
  Divider,
  Chip,
  InputAdornment,
  useTheme,
  Stack,
  IconButton
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  Close as CloseIcon, 
  Send as SendIcon,
  Feedback as FeedbackIcon,
  Category as CategoryIcon,
  Title as TitleIcon,
  Description as DescriptionIcon,
  VisibilityOff as VisibilityOffIcon,
  AttachFile as AttachFileIcon
} from '@mui/icons-material';

interface AttachmentWithPreview extends File {
  preview?: string;
}

interface FeedbackFormProps {
  feedbackToEdit?: FeedbackType | null;
  onSubmitSuccess?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ feedbackToEdit, onSubmitSuccess }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateFeedbackData>({
    type: 'feedback',
    category: 'academic',
    title: '',
    description: '',
    isAnonymous: false,
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
  const [errors, setErrors] = useState<{
    title?: string;
    description?: string;
    general?: string;
  }>({});

  // Initialize form with feedback data when editing
  useEffect(() => {
    if (feedbackToEdit) {
      setFormData({
        type: feedbackToEdit.type,
        category: feedbackToEdit.category,
        title: feedbackToEdit.title,
        description: feedbackToEdit.description,
        isAnonymous: feedbackToEdit.isAnonymous,
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
    
    // Clear the error for this field when it's changed
    if (name in errors) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
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

  const validateForm = () => {
    const newErrors: typeof errors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Please enter a title';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Please enter a description';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description should be at least 10 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
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
      
      setErrors({ general: errorMessage });
      
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

  // Get type color
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'feedback':
        return theme.palette.info.main;
      case 'complaint':
        return theme.palette.error.main;
      case 'suggestion':
        return theme.palette.success.main;
      default:
        return theme.palette.primary.main;
    }
  };

  // Get file icon and color
  const getFileTypeInfo = (mimeType: string) => {
    if (mimeType.startsWith('image/')) {
      return {
        icon: '🖼️',
        color: theme.palette.success.light
      };
    } else if (mimeType.includes('pdf')) {
      return {
        icon: '📄',
        color: theme.palette.error.light
      };
    } else if (mimeType.includes('doc')) {
      return {
        icon: '📝',
        color: theme.palette.info.light
      };
    } else {
      return {
        icon: '📎',
        color: theme.palette.warning.light
      };
    }
  };

  return (
    <Container maxWidth="md">
      <Paper 
        elevation={4} 
        sx={{ 
          p: { xs: 2, sm: 4 }, 
          mt: 4, 
          mb: 4,
          borderRadius: 2,
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Typography 
          variant="h4" 
          component="h2" 
          gutterBottom 
          align="center"
          sx={{ 
            mb: 3, 
            position: 'relative',
            '&:after': {
              content: '""',
              position: 'absolute',
              bottom: -8,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '4px',
              backgroundColor: 'primary.main',
              borderRadius: '2px'
            }
          }}
        >
          {feedbackToEdit ? 'Edit Feedback' : 'Submit Feedback'}
        </Typography>

        {errors.general && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.general}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Type</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Type"
                  required
                  startAdornment={
                    <InputAdornment position="start">
                      <FeedbackIcon 
                        sx={{ 
                          color: getTypeColor(formData.type),
                          mr: 1 
                        }} 
                      />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="feedback">Feedback</MenuItem>
                  <MenuItem value="complaint">Complaint</MenuItem>
                  <MenuItem value="suggestion">Suggestion</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth variant="outlined">
                <InputLabel>Category</InputLabel>
                <Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  label="Category"
                  required
                  startAdornment={
                    <InputAdornment position="start">
                      <CategoryIcon sx={{ color: 'primary.main', mr: 1 }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="academic">Academic</MenuItem>
                  <MenuItem value="facilities">Facilities</MenuItem>
                  <MenuItem value="harassment">Harassment</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="title"
                label="Title"
                value={formData.title}
                onChange={handleChange}
                required
                error={!!errors.title}
                helperText={errors.title}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TitleIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
                placeholder="Brief summary of your feedback"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                name="description"
                label="Description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={4}
                required
                error={!!errors.description}
                helperText={errors.description}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon sx={{ color: 'primary.main', mt: 1 }} />
                    </InputAdornment>
                  ),
                }}
                placeholder="Please provide detailed information about your feedback"
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 2 }}>
                <Chip label="Options" />
              </Divider>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isAnonymous}
                    onChange={handleSwitchChange}
                    name="isAnonymous"
                    color="primary"
                  />
                }
                label={
                  <Stack direction="row" spacing={1} alignItems="center">
                    <VisibilityOffIcon 
                      fontSize="small" 
                      sx={{ color: formData.isAnonymous ? 'primary.main' : 'text.secondary' }} 
                    />
                    <Typography>Submit Anonymously</Typography>
                  </Stack>
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
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
                    sx={{ 
                      borderRadius: '20px',
                      px: 2
                    }}
                  >
                    Attach Files
                  </Button>
                </label>
              </Box>
            </Grid>

            {formData.attachments.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachFileIcon fontSize="small" sx={{ mr: 1 }} />
                  Attachments ({formData.attachments.length})
                </Typography>
                <Paper 
                  variant="outlined" 
                  sx={{ 
                    p: 2, 
                    borderRadius: 2,
                    bgcolor: 'background.default' 
                  }}
                >
                  <Grid container spacing={2}>
                    {formData.attachments.map((attachment, index) => {
                      const fileInfo = getFileTypeInfo(attachment.file.type);
                      return (
                        <Grid item xs={6} sm={4} md={3} key={index}>
                          <Paper
                            elevation={1}
                            sx={{
                              position: 'relative',
                              height: 100,
                              borderRadius: 2,
                              overflow: 'hidden',
                              transition: 'all 0.2s',
                              '&:hover': {
                                boxShadow: 3,
                              }
                            }}
                          >
                            {attachment.file.type.startsWith('image/') ? (
                              <Box
                                component="img"
                                src={(attachment.file as AttachmentWithPreview).preview}
                                alt={attachment.filename}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover'
                                }}
                              />
                            ) : (
                              <Box
                                sx={{
                                  height: '100%',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: fileInfo.color,
                                  p: 1
                                }}
                              >
                                <Typography variant="h5" sx={{ mb: 1 }}>{fileInfo.icon}</Typography>
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    textAlign: 'center',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    display: '-webkit-box',
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: 'vertical',
                                  }}
                                >
                                  {attachment.filename}
                                </Typography>
                              </Box>
                            )}
                            <IconButton
                              size="small"
                              sx={{
                                position: 'absolute',
                                right: 4,
                                top: 4,
                                bgcolor: 'rgba(255, 255, 255, 0.8)',
                                '&:hover': {
                                  bgcolor: 'rgba(255, 255, 255, 0.95)',
                                }
                              }}
                              onClick={() => handleRemoveAttachment(index)}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Paper>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={isSubmitting}
                startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                fullWidth
                size="large"
                sx={{ 
                  mt: 2, 
                  py: 1.5,
                  borderRadius: '8px',
                  boxShadow: 2,
                  '&:hover': {
                    boxShadow: 4
                  }
                }}
              >
                {isSubmitting 
                  ? 'Submitting...' 
                  : feedbackToEdit 
                    ? 'Update Feedback' 
                    : 'Submit Feedback'
                }
              </Button>
            </Grid>
          </Grid>
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