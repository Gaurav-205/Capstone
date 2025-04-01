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
  }
};

export default profileService; 