import axios, { AxiosError } from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
};

export interface ProfileUpdateData {
  name?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  studentId?: string;
  course?: string;
  semester?: string;
  batch?: string;
  hostelBlock?: string;
  roomNumber?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  pushNotifications?: boolean;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
}

interface ApiError {
  message: string;
  [key: string]: any;
}

const handleError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;
    throw new Error(axiosError.response?.data?.message || axiosError.message);
  }
  throw new Error('An unexpected error occurred');
};

const profileService = {
  // Get profile
  getProfile: async () => {
    try {
      console.log('Making profile request...');
      const config = getAuthConfig();
      console.log('Auth config:', config);
      const response = await axios.get(`${API_URL}/profile/`, config);
      console.log('Profile response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Profile request error:', error);
      throw handleError(error);
    }
  },

  // Update profile
  updateProfile: async (data: ProfileUpdateData) => {
    try {
      const response = await axios.put(`${API_URL}/profile/`, data, getAuthConfig());
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Upload avatar
  uploadAvatar: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const config = {
        ...getAuthConfig(),
        headers: {
          ...getAuthConfig().headers,
          'Content-Type': 'multipart/form-data',
        },
      };

      const response = await axios.post(
        `${API_URL}/profile/avatar`,
        formData,
        config
      );
      return response.data;
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw handleError(error);
    }
  },

  // Change password
  changePassword: async (data: PasswordChangeData) => {
    try {
      const response = await axios.post(
        `${API_URL}/profile/change-password/`,
        data,
        getAuthConfig()
      );
      return response.data;
    } catch (error) {
      throw handleError(error);
    }
  },

  // Refresh profile - get the latest profile data and update localStorage
  refreshProfile: async () => {
    try {
      console.log('Refreshing profile data...');
      const config = getAuthConfig();
      const response = await axios.get(`${API_URL}/profile/`, config);
      
      // Check if there were any changes since last fetch
      let changed = false;
      
      // Get the current user from localStorage
      const userString = localStorage.getItem('user');
      if (userString) {
        const user = JSON.parse(userString);
        
        // Make sure we have a proper name, using email as fallback
        if (!response.data.name || response.data.name.trim() === '') {
          console.log('Name missing in profile data, using existing data or email as fallback');
          if (user.name && user.name.trim() !== '') {
            response.data.name = user.name;
          } else if (response.data.email) {
            response.data.name = response.data.email.split('@')[0]
              .charAt(0).toUpperCase() + response.data.email.split('@')[0].slice(1)
              .replace(/[._]/g, ' ');
          } else {
            response.data.name = 'User';
          }
          changed = true;
        }
        
        // Check if avatar has changed
        if (response.data.avatar !== user.avatar) {
          console.log('Profile avatar changed during refresh:', {
            before: user.avatar,
            after: response.data.avatar
          });
          changed = true;
        }
        
        // Update the user data with new profile info
        const updatedUser = {
          ...user,
          ...response.data,
          // Ensure name is never blank
          name: response.data.name || user.name || 'User',
          // Preserve essential fields that might not be in profile response
          id: user.id,
          _id: user._id || user.id,
          role: user.role
        };
        
        // Save updated user back to localStorage
        localStorage.setItem('user', JSON.stringify(updatedUser));
        console.log('Profile refreshed and localStorage updated with name:', updatedUser.name);
        
        // Clear avatar cache in case it was updated
        if (changed) {
          // Force browser to refresh the avatar image
          const timestamp = new Date().getTime();
          const avatarWithTimestamp = response.data.avatar?.includes('?') 
            ? `${response.data.avatar}&t=${timestamp}`
            : `${response.data.avatar ? response.data.avatar + '?t=' + timestamp : ''}`;
          
          if (avatarWithTimestamp) {
            console.log('Adding timestamp to force avatar refresh:', avatarWithTimestamp);
            
            // Optional: force image reload by preloading
            if (typeof window !== 'undefined' && response.data.avatar) {
              const img = new Image();
              img.src = avatarWithTimestamp;
            }
          }
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Profile refresh error:', error);
      throw handleError(error);
    }
  }
};

export default profileService; 