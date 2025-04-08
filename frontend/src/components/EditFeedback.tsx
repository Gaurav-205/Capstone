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
  ImageListItem,
  Grid,
  Divider,
  Chip,
  InputAdornment,
  Stack
} from '@mui/material';
import { 
  CloudUpload as CloudUploadIcon, 
  Close as CloseIcon, 
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

const EditFeedback: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [formData, setFormData] = useState<UpdateFeedbackData>({
    type: 'feedback',
    category: 'other',
    title: '',
    description: '',
    isAnonymous: false,
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
          isAnonymous: feedback.isAnonymous
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
  useEffect(() => {
    return () => {
      if (formData.attachments) {
        formData.attachments.forEach(attachment => {
          if ('preview' in attachment.file) {
            URL.revokeObjectURL((attachment.file as AttachmentWithPreview).preview || '');
          }
        });
      }
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
      <Paper elevation={4} sx={{ p: { xs: 2, sm: 4 }, mt: 4, mb: 4, borderRadius: 2 }}>
        <Typography variant="h4" component="h2" gutterBottom align="center" 
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
          Edit Feedback
        </Typography>
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
                      <FeedbackIcon sx={{ color: 'primary.main', mr: 1 }} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="feedback">General Feedback</MenuItem>
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
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <TitleIcon sx={{ color: 'primary.main' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12}>
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
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <DescriptionIcon sx={{ color: 'primary.main', mt: 1 }} />
                    </InputAdornment>
                  ),
                }}
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
                    <VisibilityOffIcon fontSize="small" sx={{ color: formData.isAnonymous ? 'primary.main' : 'text.secondary' }} />
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
                    sx={{ borderRadius: '20px', px: 2 }}
                  >
                    Add Attachments
                  </Button>
                </label>
              </Box>
            </Grid>

            {existingAttachments.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachFileIcon fontSize="small" sx={{ mr: 1 }} />
                  Existing Attachments
                </Typography>
                <Grid container spacing={2}>
                  {existingAttachments.map((attachment, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Paper
                        elevation={1}
                        sx={{
                          position: 'relative',
                          height: 100,
                          borderRadius: 2,
                          overflow: 'hidden',
                        }}
                      >
                        {attachment.mimetype.startsWith('image/') ? (
                          <Box
                            component="img"
                            src={`${process.env.REACT_APP_API_URL}${attachment.url}`}
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
                              bgcolor: 'grey.100',
                              p: 1
                            }}
                          >
                            <Typography variant="body2" sx={{ textAlign: 'center' }}>
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
                          }}
                          onClick={() => handleRemoveExistingAttachment(index)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}

            {formData.attachments && formData.attachments.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachFileIcon fontSize="small" sx={{ mr: 1 }} />
                  New Attachments
                </Typography>
                <Grid container spacing={2}>
                  {formData.attachments.map((attachment, index) => (
                    <Grid item xs={6} sm={4} md={3} key={index}>
                      <Paper
                        elevation={1}
                        sx={{
                          position: 'relative',
                          height: 100,
                          borderRadius: 2,
                          overflow: 'hidden',
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
                              bgcolor: 'grey.100',
                              p: 1
                            }}
                          >
                            <Typography variant="body2" sx={{ textAlign: 'center' }}>
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
                          }}
                          onClick={() => handleRemoveAttachment(index)}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}

            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={isSubmitting}
                sx={{ mt: 2, py: 1.5, borderRadius: '8px' }}
              >
                {isSubmitting ? 'Updating...' : 'Update Feedback'}
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

export default EditFeedback; 