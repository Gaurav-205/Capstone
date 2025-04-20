import React, { useState, useEffect, useRef } from 'react';
import {
  Container,
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  Avatar,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tabs,
  Tab,
  Badge,
  Tooltip,
  Snackbar,
} from '@mui/material';
import {
  Person as PersonIcon,
  PhotoCamera as PhotoCameraIcon,
  School as SchoolIcon,
  Notifications as NotificationsIcon,
  Security as SecurityIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import profileService from '../services/profileService';
import { getAvatarUrl } from '../utils/avatarUtils';
import axios from 'axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

// Add a form data interface
interface ProfileFormData {
  // Personal Information
  name: string;
  email: string;
  phone: string;
  avatar: string;
  dateOfBirth: string;
  gender: string;
  
  // Academic Information
  studentId: string;
  course: string;
  semester: string;
  batch: string;
  hostelBlock: string;
  roomNumber: string;

  // Contact Preferences
  emailNotifications: boolean;
  smsNotifications: boolean;
  pushNotifications: boolean;

  // Password Change
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
};

interface ApiError {
  message: string;
  [key: string]: any;
}

const handleApiError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return (error as ApiError).message;
  }
  return 'An unexpected error occurred';
};

const Profile: React.FC = () => {
  const { user, updateUserState } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState({ type: 'success', text: '' });
  const [showMessage, setShowMessage] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSocialLogin, setIsSocialLogin] = useState(false);

  console.log('Profile component rendering', { 
    user, 
    avatar: user?.avatar,
    avatarUrl: user?.avatar ? getAvatarUrl(user.avatar) : 'none' 
  });

  // Initialize form data with user data
  const [formData, setFormData] = useState<ProfileFormData>({
    // Personal Information
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    dateOfBirth: '',
    gender: '',
    
    // Academic Information
    studentId: user?.studentId || '',
    course: '',
    semester: '',
    batch: '',
    hostelBlock: '',
    roomNumber: '',

    // Contact Preferences
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,

    // Password Change
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setLoading(true);
        await loadProfile();
        setInitialLoadComplete(true);
      } catch (error) {
        console.error('Initial profile data load failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadInitialData();
  }, []);

  // Check if user is a social login user
  useEffect(() => {
    if (user) {
      setIsSocialLogin(!user.hasSetPassword);
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const profile = await profileService.getProfile();
      setFormData(prev => ({
        ...prev,
        name: profile.name || user?.name || '',
        email: profile.email || user?.email || '',
        phone: profile.phone || user?.phone || '',
        avatar: profile.avatar || user?.avatar || '',
        dateOfBirth: profile.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
        gender: profile.gender || '',
        studentId: profile.studentId || '',
        course: profile.course || '',
        semester: profile.semester || '',
        batch: profile.batch || '',
        hostelBlock: profile.hostelBlock || '',
        roomNumber: profile.roomNumber || '',
        emailNotifications: profile.notificationPreferences?.email ?? true,
        smsNotifications: profile.notificationPreferences?.sms ?? true,
        pushNotifications: profile.notificationPreferences?.push ?? true,
      }));
    } catch (error: unknown) {
      console.error('Error loading profile:', error);
      setError(handleApiError(error));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setHasUnsavedChanges(true);
  };

  const handleSelectChange = (e: any) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setHasUnsavedChanges(true);
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        const response = await profileService.uploadAvatar(file);
        setFormData(prev => ({ ...prev, avatar: response.avatar }));
        updateUserState({ avatar: response.avatar });
        setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
        setShowMessage(true);
        setHasUnsavedChanges(true);
      } catch (error) {
        console.error('Avatar upload error:', error);
        setMessage({ type: 'error', text: 'Failed to update profile picture' });
        setShowMessage(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const validateForm = () => {
    // Password validation
    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        setError('New password must be at least 8 characters long');
        return false;
      }
      
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!passwordRegex.test(formData.newPassword)) {
        setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)');
        return false;
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return false;
      }
      
      if (!formData.currentPassword) {
        setError('Current password is required to set a new password');
        return false;
      }
    }

    if (formData.phone && !/^\+?[\d\s-]{10,}$/.test(formData.phone)) {
      setError('Invalid phone number format');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (tabValue === 3 && formData.newPassword) {
        // Handle password change separately
        await profileService.changePassword({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        });
        setSuccess('Password updated successfully');
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        setHasUnsavedChanges(false);
      } else {
        // Handle profile update
        const updatedProfile = await profileService.updateProfile({
          name: formData.name,
          phone: formData.phone,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          studentId: formData.studentId,
          course: formData.course,
          semester: formData.semester,
          batch: formData.batch,
          hostelBlock: formData.hostelBlock,
          roomNumber: formData.roomNumber,
          emailNotifications: formData.emailNotifications,
          smsNotifications: formData.smsNotifications,
          pushNotifications: formData.pushNotifications,
        });
        updateUserState(updatedProfile);
        setSuccess('Profile updated successfully');
        setHasUnsavedChanges(false);
      }
    } catch (error: unknown) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    if (hasUnsavedChanges) {
      if (window.confirm('You have unsaved changes. Are you sure you want to switch tabs?')) {
        setTabValue(newValue);
        setHasUnsavedChanges(false);
      }
    } else {
      setTabValue(newValue);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Profile Settings
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Manage your personal information and preferences
        </Typography>
      </Box>

      <Paper elevation={3} sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile settings tabs">
            <Tab icon={<PersonIcon />} label="PERSONAL" />
            <Tab icon={<SchoolIcon />} label="ACADEMIC" />
            <Tab icon={<NotificationsIcon />} label="PREFERENCES" />
            <Tab icon={<SecurityIcon />} label="SECURITY" />
          </Tabs>
        </Box>

        <form onSubmit={handleSubmit}>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12} display="flex" justifyContent="center">
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                  badgeContent={
                    <Tooltip title="Change avatar">
                      <IconButton
                        onClick={handleAvatarClick}
                        sx={{
                          bgcolor: 'primary.main',
                          '&:hover': { bgcolor: 'primary.dark' },
                        }}
                      >
                        <PhotoCameraIcon sx={{ color: 'white', fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>
                  }
                >
                  {loading ? (
                    <Avatar
                      sx={{
                        width: 100,
                        height: 100,
                        bgcolor: 'grey.300'
                      }}
                    >
                      <CircularProgress size={40} />
                    </Avatar>
                  ) : (
                    <Avatar
                      src={getAvatarUrl(formData.avatar)}
                      alt={formData.name || 'User avatar'}
                      sx={{ 
                        width: 100, 
                        height: 100, 
                        cursor: 'pointer',
                        fontSize: '3rem', // Larger font size for the fallback letter
                        bgcolor: 'primary.main', // Use primary color for fallback background
                      }}
                      onClick={handleAvatarClick}
                    >
                      {formData.name ? formData.name.charAt(0).toUpperCase() : <PersonIcon fontSize="large" />}
                    </Avatar>
                  )}
                </Badge>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handleFileChange}
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1 (234) 567-8900"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Date of Birth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Gender</InputLabel>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleSelectChange}
                    label="Gender"
                  >
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                    <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Student ID"
                  name="studentId"
                  value={formData.studentId}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Semester"
                  name="semester"
                  value={formData.semester}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Batch"
                  name="batch"
                  value={formData.batch}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Hostel Block"
                  name="hostelBlock"
                  value={formData.hostelBlock}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Room Number"
                  name="roomNumber"
                  value={formData.roomNumber}
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '200px',
              textAlign: 'center',
              p: 4
            }}>
              <NotificationsIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom>
                Preferences Coming Soon!
              </Typography>
              <Typography variant="body1" color="text.secondary">
                We're working hard to bring you customizable notification preferences.
                Stay tuned for updates!
              </Typography>
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Change Password
                </Typography>
                {isSocialLogin ? (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    You logged in using a social account (like Google). Please set up a password first.
                    <Box sx={{ mt: 2 }}>
                      <Button
                        variant="contained"
                        color="primary"
                        onClick={async () => {
                          // Validate password
                          if (!formData.newPassword) {
                            setError('New password is required');
                            return;
                          }

                          if (formData.newPassword.length < 8) {
                            setError('New password must be at least 8 characters long');
                            return;
                          }
                          
                          const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                          if (!passwordRegex.test(formData.newPassword)) {
                            setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)');
                            return;
                          }
                          
                          if (formData.newPassword !== formData.confirmPassword) {
                            setError('New passwords do not match');
                            return;
                          }
                          
                          setLoading(true);
                          setError('');
                          setSuccess('');
                          
                          try {
                            const response = await axios.post(
                              `${process.env.REACT_APP_API_URL || 'http://localhost:5000/api'}/auth/set-password`,
                              {
                                password: formData.newPassword.trim()
                              },
                              {
                                headers: {
                                  'Authorization': `Bearer ${localStorage.getItem('token')}`,
                                  'Content-Type': 'application/json'
                                }
                              }
                            );
                            
                            setSuccess('Password set successfully');
                            setIsSocialLogin(false);
                            setFormData(prev => ({
                              ...prev,
                              currentPassword: '',
                              newPassword: '',
                              confirmPassword: '',
                            }));
                          } catch (error: unknown) {
                            console.error('Set password error:', error);
                            setError(handleApiError(error));
                          } finally {
                            setLoading(false);
                          }
                        }}
                        disabled={loading || !formData.newPassword || !formData.confirmPassword}
                      >
                        {loading ? <CircularProgress size={24} /> : 'Set Password'}
                      </Button>
                    </Box>
                  </Alert>
                ) : (
                  <>
                    <Typography variant="body2" color="text.secondary" gutterBottom>
                      Password must be at least 8 characters long and contain:
                    </Typography>
                    <Box component="ul" sx={{ pl: 2, mb: 2 }}>
                      <Typography component="li" variant="body2" color="text.secondary">
                        At least one uppercase letter
                      </Typography>
                      <Typography component="li" variant="body2" color="text.secondary">
                        At least one lowercase letter
                      </Typography>
                      <Typography component="li" variant="body2" color="text.secondary">
                        At least one number
                      </Typography>
                      <Typography component="li" variant="body2" color="text.secondary">
                        At least one special character (@$!%*?&)
                      </Typography>
                    </Box>
                  </>
                )}
              </Grid>
              {!isSocialLogin && (
                <>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Current Password"
                      name="currentPassword"
                      type="password"
                      value={formData.currentPassword}
                      onChange={handleChange}
                      required
                      error={!!error && error.includes('Current password')}
                      helperText={error && error.includes('Current password') ? error : ''}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="New Password"
                      name="newPassword"
                      type="password"
                      value={formData.newPassword}
                      onChange={handleChange}
                      required
                      error={!!error && (error.includes('New password') || error.includes('Password must contain'))}
                      helperText={error && (error.includes('New password') || error.includes('Password must contain')) ? error : ''}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      fullWidth
                      label="Confirm New Password"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      error={!!error && error.includes('passwords do not match')}
                      helperText={error && error.includes('passwords do not match') ? error : ''}
                    />
                  </Grid>
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={async () => {
                        // Validate password
                        if (!formData.currentPassword) {
                          setError('Current password is required');
                          return;
                        }

                        if (!formData.newPassword) {
                          setError('New password is required');
                          return;
                        }

                        if (formData.newPassword.length < 8) {
                          setError('New password must be at least 8 characters long');
                          return;
                        }
                        
                        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
                        if (!passwordRegex.test(formData.newPassword)) {
                          setError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)');
                          return;
                        }
                        
                        if (formData.newPassword !== formData.confirmPassword) {
                          setError('New passwords do not match');
                          return;
                        }
                        
                        setLoading(true);
                        setError('');
                        setSuccess('');
                        
                        try {
                          const passwordData = {
                            currentPassword: formData.currentPassword.trim(),
                            newPassword: formData.newPassword.trim()
                          };
                          
                          console.log('Sending password change request with data:', {
                            currentPassword: passwordData.currentPassword ? '***' : 'undefined',
                            newPassword: passwordData.newPassword ? '***' : 'undefined'
                          });

                          await profileService.changePassword(passwordData);
                          setSuccess('Password updated successfully');
                          setFormData(prev => ({
                            ...prev,
                            currentPassword: '',
                            newPassword: '',
                            confirmPassword: '',
                          }));
                        } catch (error: unknown) {
                          console.error('Password change error:', error);
                          setError(handleApiError(error));
                        } finally {
                          setLoading(false);
                        }
                      }}
                      disabled={loading || !formData.currentPassword || !formData.newPassword || !formData.confirmPassword}
                      sx={{ minWidth: 200 }}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Change Password'}
                    </Button>
                  </Grid>
                </>
              )}
            </Grid>
          </TabPanel>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            {hasUnsavedChanges && tabValue !== 3 && (
              <Button
                variant="outlined"
                color="primary"
                onClick={() => {
                  if (window.confirm('Are you sure you want to discard changes?')) {
                    loadProfile();
                    setHasUnsavedChanges(false);
                  }
                }}
              >
                Discard Changes
              </Button>
            )}
            {tabValue !== 3 && (
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={loading || !hasUnsavedChanges}
                sx={{ minWidth: 200 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            )}
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={showMessage}
        autoHideDuration={6000}
        onClose={() => setShowMessage(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowMessage(false)} 
          severity={message.type as 'success' | 'error'} 
          sx={{ width: '100%' }}
        >
          {message.text}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;