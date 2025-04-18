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

  // Force refresh profile data on initial render
  useEffect(() => {
    const loadInitialData = async () => {
      console.log('Initial profile data load');
      try {
        setLoading(true);
        
        // Force refresh profile data from server
        await profileService.refreshProfile();
        
        // Load complete profile data
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

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      console.log('User updated, updating form data with new user data:', user);
      setFormData(prev => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        phone: user.phone || prev.phone,
        avatar: user.avatar || prev.avatar,
        studentId: user.studentId || prev.studentId,
      }));
    }
  }, [user]);

  useEffect(() => {
    // If we have a user with an avatar, make sure to update form data
    if (user?.avatar) {
      console.log('User avatar found on component mount, updating form data:', user.avatar);
      const avatarString: string = user.avatar; // Type assertion
      setFormData(prev => ({
        ...prev,
        avatar: avatarString
      }));
    }
  }, []);

  const loadProfile = async () => {
    try {
      console.log('Loading profile...');
      setLoading(true);
      const profile = await profileService.getProfile();
      console.log('Received profile:', profile);
      
      // Make sure we're using the latest avatar from either source
      const avatarToUse = profile.avatar || user?.avatar || '';
      console.log('Using avatar:', avatarToUse);
      
      setFormData(prev => {
        const newData = {
          ...prev,
          name: profile.name || user?.name || '',
          email: profile.email || user?.email || '',
          phone: profile.phone || user?.phone || '',
          avatar: avatarToUse,
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
        };
        console.log('Updated form data:', newData);
        return newData;
      });
      
      // If we got a new avatar from the profile service, update the auth context
      if (profile.avatar && profile.avatar !== user?.avatar) {
        updateUserState({ avatar: profile.avatar });
      }
    } catch (error: unknown) {
      console.error('Error loading profile:', error);
      setError(handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSelectChange = (e: any) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
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
        console.log('Avatar upload response:', response);
        
        // Extract the avatar path
        const avatarPath = response.avatar;
        console.log('Avatar path received:', avatarPath);
        
        // Update the form data with the new avatar
        setFormData(prev => ({ ...prev, avatar: avatarPath }));
        
        // Update auth context with new avatar
        updateUserState({ avatar: avatarPath });
        
        setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
        setShowMessage(true);
      } catch (error) {
        console.error('Avatar upload error:', error);
        setMessage({ type: 'error', text: 'Failed to update profile picture' });
        setShowMessage(true);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
    
    // When navigating to the personal tab (index 0), refresh the avatar from user context
    if (newValue === 0 && user?.avatar) {
      const avatarString: string = user.avatar; // Type assertion
      setFormData(prev => ({
        ...prev,
        avatar: avatarString
      }));
    }
  };

  const validateForm = () => {
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    
    if (formData.newPassword && !formData.currentPassword) {
      setError('Current password is required to set a new password');
      return false;
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
      } else {
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
        // Update auth context with new profile data
        updateUserState(updatedProfile);
        setSuccess('Profile updated successfully');
      }
    } catch (error: unknown) {
      setError(handleApiError(error));
    } finally {
      setLoading(false);
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
              </Grid>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
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
                />
              </Grid>
            </Grid>
          </TabPanel>

          <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ minWidth: 200 }}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Changes'}
            </Button>
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