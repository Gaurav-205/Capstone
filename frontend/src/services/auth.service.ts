import axios from 'axios';
import { API_URL, FRONTEND_URL } from '../config';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.timeout = 30000; // 30 seconds default timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';
axios.defaults.headers.common['Accept'] = 'application/json';

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000;

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Add request logging with sensitive data protection
axios.interceptors.request.use(request => {
  const logSafeRequest = {
    url: request.url,
    method: request.method,
    headers: { ...request.headers },
    data: request.data ? { 
      ...request.data,
      password: request.data.password ? '[REDACTED]' : undefined
    } : undefined
  };
  console.log('Starting Request:', logSafeRequest);
  return request;
});

// Add response logging with error handling
axios.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data ? {
        ...response.data,
        token: response.data.token ? '[REDACTED]' : undefined
      } : undefined
    });
    return response;
  },
  error => {
    const errorResponse = {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code
    };
    console.error('Response Error:', errorResponse);
    return Promise.reject(error);
  }
);

// Types
export interface AuthResponse {
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
  errors?: {
    [key: string]: string;
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
  confirmPassword?: string;
  phone?: string;
  role?: 'user' | 'admin' | 'student';
}

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface SetPasswordResponse {
  success: boolean;
  message: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'student';
  phone?: string;
  avatar?: string;
  hasSetPassword: boolean;
}

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: User | null = null;
  private requestInterceptor: number | null = null;
  private responseInterceptor: number | null = null;

  private constructor() {
    this.initializeFromStorage();
    this.setupInterceptors();
  }

  private initializeFromStorage() {
    try {
      this.token = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        this.user = JSON.parse(storedUser);
      }
      if (this.token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${this.token}`;
      }
    } catch (error) {
      console.error('Error initializing from storage:', error);
      this.clearAuth();
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private setupInterceptors() {
    if (this.requestInterceptor !== null) {
      axios.interceptors.request.eject(this.requestInterceptor);
    }
    if (this.responseInterceptor !== null) {
      axios.interceptors.response.eject(this.responseInterceptor);
    }

    this.requestInterceptor = axios.interceptors.request.use(
      (config) => {
        if (this.token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    this.responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // For login requests, return error message without redirecting
          const isLoginRequest = error.config.url.includes('/login');
          if (isLoginRequest) {
            return Promise.reject(error);
          }
          
          // For other requests, clear auth and redirect if not on login page
          const isLoginPage = window.location.pathname.includes('/login');
          if (!isLoginPage) {
            this.clearAuth();
            window.location.href = `${FRONTEND_URL}/login?error=session_expired`;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private validateSignupData(data: SignupData): string[] {
    const errors: string[] = [];

    // Name validation
    if (!data.name || data.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!data.email || !emailRegex.test(data.email)) {
      errors.push('Please enter a valid email address');
    }

    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!data.password) {
      errors.push('Password is required');
    } else if (data.password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    } else if (!passwordRegex.test(data.password)) {
      errors.push('Password must contain at least one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&)');
    }

    // Password match validation
    if (data.confirmPassword && data.password !== data.confirmPassword) {
      errors.push('Passwords do not match');
    }

    // Phone validation (optional)
    if (data.phone && !/^\d{10}$/.test(data.phone)) {
      errors.push('Phone number must be 10 digits');
    }

    return errors;
  }

  private validateLoginData(data: LoginData): string[] {
    const errors: string[] = [];

    if (!data.email || !data.email.includes('@')) {
      errors.push('Please enter a valid email address');
    }

    if (!data.password) {
      errors.push('Password is required');
    }

    return errors;
  }

  public async login(loginData: LoginData): Promise<AuthResponse> {
    try {
      console.log('auth.service: Starting login process');
      
      // Clear any existing auth data before attempting login
      this.clearAuth();
      
      // Make the login request with a short timeout
      const response = await axios.post<AuthResponse>(
        `${API_URL}/auth/login`,
        loginData,
        { timeout: 8000 } // 8-second timeout
      );
      
      // Handle successful login
      if (response.data.success && response.data.token && response.data.user) {
        console.log('auth.service: Login successful');
        this.setAuth(response.data.token, response.data.user);
        return response.data;
      }
      
      // If we got a 200 response but missing data, return error
      console.error('auth.service: Invalid server response - missing token or user');
      return {
        success: false,
        message: 'Login failed due to invalid server response',
        errors: {
          server: 'The server returned an incomplete response'
        }
      };
    } catch (error: any) {
      console.error('auth.service: Login error:', error.response?.status || error.message);
      
      // Pass through error responses from the server
      if (error.response?.data) {
        return {
          success: false,
          message: error.response.data.message || 'Login failed',
          errors: error.response.data.errors || { 
            auth: error.response.status === 401 
              ? 'Invalid email or password' 
              : 'Login failed' 
          }
        };
      }
      
      // Handle timeout errors
      if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
        return {
          success: false,
          message: 'Request timed out',
          errors: {
            server: 'The server took too long to respond. Please try again.'
          }
        };
      }
      
      // Handle network errors
      if (!error.response) {
        return {
          success: false,
          message: 'Network error',
          errors: {
            server: 'Cannot connect to the server. Please check your internet connection.'
          }
        };
      }
      
      // Handle any other errors
      return {
        success: false,
        message: 'Login failed',
        errors: {
          server: error.message || 'An unexpected error occurred'
        }
      };
    }
  }

  public async logout(): Promise<void> {
    try {
      console.log('Starting logout process...');
      
      // Clear all auth-related state
      this.clearAuth();
      
      // Remove interceptors
      if (this.requestInterceptor !== null) {
        axios.interceptors.request.eject(this.requestInterceptor);
        this.requestInterceptor = null;
      }
      if (this.responseInterceptor !== null) {
        axios.interceptors.response.eject(this.responseInterceptor);
        this.responseInterceptor = null;
      }
      
      // Reset axios defaults
      delete axios.defaults.headers.common['Authorization'];
      
      console.log('Logout successful, redirecting to login page...');
      
      // Use window.location.replace for a clean redirect
      const isLoginPage = window.location.pathname.includes('/login');
      if (!isLoginPage) {
        window.location.replace(`${FRONTEND_URL}/login?message=logged_out`);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if there's an error
      localStorage.clear();
      const isLoginPage = window.location.pathname.includes('/login');
      if (!isLoginPage) {
        window.location.replace(`${FRONTEND_URL}/login?error=logout_error`);
      }
    }
  }

  private setAuth(token: string, user: User) {
    try {
      // Clear any existing auth first
      this.clearAuth();
      
      // Set new auth data
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Refresh interceptors
      this.setupInterceptors();
    } catch (error) {
      console.error('Error setting auth:', error);
      this.clearAuth();
      throw error;
    }
  }

  public clearAuth() {
    console.log('Clearing auth state...');
    
    // Clear instance variables
    this.token = null;
    this.user = null;
    
    // Clear all auth-related items from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Clear any other potential auth-related items
    localStorage.removeItem('authState');
    localStorage.removeItem('session');
    
    // Reset axios defaults while maintaining necessary settings
    delete axios.defaults.headers.common['Authorization'];
    axios.defaults.withCredentials = true;
    
    console.log('Auth state cleared successfully');
  }

  public getToken(): string | null {
    return this.token;
  }

  public getUser(): User | null {
    return this.user;
  }

  public isAuthenticated(): boolean {
    return !!(this.user || localStorage.getItem('user'));
  }

  public async handleGoogleCallback(token: string): Promise<AuthResponse> {
    try {
      // Store the token
      this.token = token;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

      // Get user data
      const response = await this.getCurrentUser();
      if (response) {
        // Ensure the user has a name property - use email username if name is missing
        if (!response.name && response.email) {
          console.log('Name missing in Google auth response, using email username instead');
          response.name = response.email.split('@')[0];
          // Capitalize first letter and replace dots/underscores with spaces
          response.name = response.name
            .charAt(0).toUpperCase() + response.name.slice(1)
            .replace(/[._]/g, ' ');
        }

        this.user = response;
        localStorage.setItem('user', JSON.stringify(response));
        return {
          success: true,
          token,
          user: response
        };
      }
      throw new Error('Failed to get user data');
    } catch (error) {
      console.error('Google callback handling error:', error);
      this.clearAuth();
      throw error;
    }
  }

  public async getCurrentUser(): Promise<User | null> {
    try {
      // First check if we have a local user
      if (this.user) {
        return this.user;
      }

      // If no local user, try to fetch from server
      const response = await axios.get(`${API_URL}/auth/me`);
      if (response.data) {
        // Update local storage and instance with latest user data
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      }
      return null;
    } catch (error) {
      console.error('Error getting current user:', error);
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        this.clearAuth();
      }
      return null;
    }
  }

  public async signup(data: SignupData): Promise<AuthResponse> {
    try {
      console.log('Starting signup process...');
      console.log('Environment:', process.env.NODE_ENV);
      console.log('API URL being used:', API_URL);
      console.log('Request data:', { ...data, password: '[REDACTED]' });

      // Format the request data
      const signupData = {
        name: data.name.trim(),
        email: data.email.toLowerCase().trim(),
        password: data.password,
        confirmPassword: data.confirmPassword
      };

      console.log('Sending signup request to:', `${API_URL}/auth/signup`);

      const response = await axios.post<AuthResponse>(
        `${API_URL}/auth/signup`,
        signupData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      // Log the full response for debugging
      console.log('Full server response:', {
        status: response.status,
        statusText: response.statusText,
        headers: response.headers,
        data: {
          ...response.data,
          token: response.data.token ? '[PRESENT]' : '[MISSING]',
          user: response.data.user ? '[PRESENT]' : '[MISSING]'
        }
      });

      if (!response.data) {
        console.error('Server response missing data');
        return {
          success: false,
          message: 'Server error: Empty response',
          errors: { server: 'No data received from server' }
        };
      }

      if (!response.data.success && response.data.message) {
        console.log('Server indicated failure:', response.data.message);
        return response.data;
      }

      // Check for cookie-based authentication
      const hasCookie = document.cookie.includes('connect.sid') || 
                       document.cookie.includes('jwt') ||
                       response.headers['set-cookie']?.some(cookie => 
                         cookie.includes('connect.sid') || cookie.includes('jwt'));

      console.log('Authentication check:', {
        hasToken: !!response.data.token,
        hasUser: !!response.data.user,
        hasCookie: hasCookie,
        cookies: document.cookie
      });

      // Accept user data even without token (backend might be using cookie auth)
      if (response.data.user) {
        console.log('User data received, storing in local storage');
        
        // Store the user data
        localStorage.setItem('user', JSON.stringify(response.data.user));
        this.user = response.data.user;
        
        // If we also have a token, store it too
        if (response.data.token) {
          console.log('Token received, storing for authentication');
          this.setToken(response.data.token);
        }
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token,
          message: 'Signup successful'
        };
      }

      console.error('Invalid authentication data:', {
        hasToken: !!response.data.token,
        hasUser: !!response.data.user,
        hasCookie: hasCookie
      });

      return {
        success: false,
        message: 'Authentication failed: Invalid server response',
        errors: {
          server: 'Server response missing required authentication data',
          details: JSON.stringify({
            hasToken: !!response.data.token,
            hasUser: !!response.data.user,
            hasCookie: hasCookie
          })
        }
      };

    } catch (error: any) {
      console.error('Signup error:', error);

      // Handle network errors
      if (error?.code === 'ECONNABORTED') {
        return {
          success: false,
          message: 'Request timed out',
          errors: {
            network: 'The server took too long to respond. Please try again.'
          }
        };
      }

      // Handle axios errors
      if (error?.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const serverError = error.response.data;
        return {
          success: false,
          message: serverError?.message || 'Server error occurred',
          errors: serverError?.errors || {
            server: 'An unexpected error occurred on the server'
          }
        };
      } else if (error?.request) {
        // The request was made but no response was received
        return {
          success: false,
          message: 'No response from server',
          errors: {
            network: 'Unable to reach the server. Please check your internet connection.'
          }
        };
      }

      // Handle other errors
      return {
        success: false,
        message: 'An unexpected error occurred',
        errors: {
          server: process.env.NODE_ENV === 'development' ? String(error?.message || 'Unknown error') : 'Internal error'
        }
      };
    }
  }

  // Helper method to set token
  private setToken(token: string): void {
    this.token = token;
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  public async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await axios.post<{ message: string }>(`${API_URL}/auth/forgot-password`, { email });
      return response.data;
    } catch (error: any) {
      throw new Error(`Password reset request failed: ${error.response?.data?.message || error.message}`);
    }
  }

  public async resetPassword(token: string, password: string): Promise<ResetPasswordResponse> {
    try {
      const response = await axios.post<ResetPasswordResponse>(`${API_URL}/auth/reset-password`, {
        token,
        password
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Password reset failed: ${error.response?.data?.message || error.message}`);
    }
  }

  public async setPassword(password: string): Promise<SetPasswordResponse> {
    try {
      if (!this.isAuthenticated()) {
        throw new Error('You must be logged in to set a password');
      }

      if (!password) {
        throw new Error('Password is required');
      }

      const response = await axios.post<SetPasswordResponse>(`${API_URL}/auth/set-password`, {
        password
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });

      // Update the user's hasSetPassword status
      if (this.user) {
        this.user.hasSetPassword = true;
        localStorage.setItem('user', JSON.stringify(this.user));
      }

      return response.data;
    } catch (error: any) {
      if (error.response) {
        switch (error.response.status) {
          case 400:
            throw new Error('Password does not meet requirements. Please ensure it has at least 8 characters, including uppercase, lowercase, numbers, and special characters.');
          case 401:
            throw new Error('Your session has expired. Please log in again.');
          case 409:
            throw new Error('You have already set a password for this account.');
          case 422:
            throw new Error('Invalid password format. Please try a different password.');
          case 429:
            throw new Error('Too many attempts. Please wait a moment before trying again.');
          case 500:
            throw new Error('Server error. Please try again later.');
          default:
            throw new Error(`Setting password failed: ${error.response.data?.message || 'Unknown error occurred'}`);
        }
      }
      throw new Error('Network error. Please check your internet connection and try again.');
    }
  }
}

// Create and export a singleton instance
const authService = AuthService.getInstance();
export default authService;