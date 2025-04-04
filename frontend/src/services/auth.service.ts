import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';

// Types
export interface AuthResponse {
  success: boolean;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    hasSetPassword: boolean;
    role?: 'admin' | 'user' | 'student';
  };
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SignupData {
  name: string;
  email: string;
  password: string;
}

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor to include auth token
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('Request Error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request);
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error setting up request:', error.message);
    }
    return Promise.reject(error);
  }
);

class AuthService {
  private static instance: AuthService;

  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  public async login(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Login attempt with:', { email, API_URL });
      const response = await axios.post('/auth/login', { email, password });
      console.log('Login response:', response.data);
      
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error);
      if (!error.response) {
        throw { message: 'No response from server' };
      }
      throw error.response.data;
    }
  }

  public async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await axios.post('/auth/signup', data);
      return response.data;
    } catch (error: any) {
      console.error('Signup error:', error);
      throw error.response?.data || { message: 'Signup failed' };
    }
  }

  public async logout(): Promise<void> {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  public isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  }

  public async getCurrentUser(): Promise<AuthResponse> {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      const response = await axios.get('/auth/me');
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', error);
      throw error.response?.data || { message: 'Failed to get current user' };
    }
  }

  public async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await axios.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      console.error('Forgot password error:', error);
      throw error.response?.data || { message: 'Failed to process forgot password request' };
    }
  }

  public async resetPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      const response = await axios.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error: any) {
      console.error('Reset password error:', error);
      throw error.response?.data || { message: 'Failed to reset password' };
    }
  }

  public async setPassword(password: string): Promise<{ message: string }> {
    try {
      const response = await axios.post('/auth/set-password', { password });
      return response.data;
    } catch (error: any) {
      console.error('Set password error:', error);
      throw error.response?.data || { message: 'Failed to set password' };
    }
  }

  public async handleGoogleCallback(token: string): Promise<AuthResponse> {
    try {
      const response = await axios.get(`/auth/google/callback?token=${token}`);
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      return response.data;
    } catch (error: any) {
      console.error('Google callback error:', error);
      throw error.response?.data || { message: 'Failed to process Google login' };
    }
  }
}

export default AuthService.getInstance(); 