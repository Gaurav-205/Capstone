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
    console.log('Starting login process...');
    let retryCount = 0;
    let lastError: any = null;

    // Clear any existing auth before attempting login
    this.clearAuth();

    while (retryCount < MAX_RETRIES) {
      try {
        console.log(`Attempting login (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        
        const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, loginData);
        
        if (!response.data.token || !response.data.user) {
          throw new Error('Invalid response from server: missing token or user data');
        }

        const { token, user } = response.data;
        this.setAuth(token, user);
        console.log('Login successful');
        return response.data;
      } catch (error: any) {
        lastError = error;
        console.error(`Login attempt ${retryCount + 1} failed:`, error.response?.data || error.message);

        // Clear any partially saved auth data on error
        this.clearAuth();

        if (error.response?.status === 401) {
          return {
            success: false,
            message: 'Invalid email or password',
            errors: {
              auth: 'The email or password you entered is incorrect. Please try again.'
            }
          };
        }

        if (error.response?.status === 404) {
          return {
            success: false,
            message: 'Login service not available',
            errors: {
              server: 'The login service is currently unavailable. Please try again later.'
            }
          };
        }

        if (retryCount < MAX_RETRIES - 1 && (!error.response || error.response.status >= 500)) {
          console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
          await delay(RETRY_DELAY);
          retryCount++;
        } else {
          break;
        }
      }
    }

    // If we've exhausted retries or hit a non-retryable error
    return {
      success: false,
      message: lastError?.response?.data?.message || 'Login failed',
      errors: {
        server: lastError?.response?.data?.errors?.server || 
                lastError?.message || 
                'Unable to connect to the server. Please check your internet connection and try again.'
      }
    };
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

  private clearAuth() {
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

  public async handleGoogleCallback(token: string): Promise<void> {
    try {
      console.log('Handling Google callback with token');
      
      if (!token) {
        throw new Error('Authentication failed: No token received from Google');
      }

      // Clear any existing auth state before setting new one
      this.clearAuth();

      // Validate token format
      if (!/^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/.test(token)) {
        throw new Error('Invalid token format');
      }

      // Set the token directly since it's already a JWT from our backend
      this.token = token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user data using the token
      const response = await axios.get<User>(`${API_URL}/auth/me`, {
        timeout: 10000, // 10 second timeout
        validateStatus: (status) => status === 200 // Only accept 200 status
      });
      
      if (!response.data) {
        throw new Error('Authentication failed: Unable to retrieve user information');
      }

      // Update user data with Google auth specific fields
      const updatedUser = {
        ...response.data,
        hasSetPassword: true,
        provider: 'google',
        lastLogin: new Date().toISOString()
      };

      // Set auth state with token and updated user data
      this.setAuth(token, updatedUser);
      
      // Store updated user data
      this.user = updatedUser;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Set a flag to indicate successful Google auth
      localStorage.setItem('googleAuthComplete', 'true');
      
      console.log('Google authentication complete');
      
      // Get the current environment
      const isDevelopment = process.env.NODE_ENV === 'development';
      const baseUrl = isDevelopment ? 'http://localhost:3000' : FRONTEND_URL;
      
      // Get return URL from localStorage or default to dashboard
      const returnUrl = localStorage.getItem('returnUrl') || '/dashboard';
      localStorage.removeItem('returnUrl'); // Clean up
      
      // Construct the full URL
      const redirectUrl = new URL(returnUrl, baseUrl).toString();
      
      // Perform the redirect
      window.location.href = redirectUrl;
    } catch (error: any) {
      console.error('Google authentication error:', error);
      this.clearAuth();
      localStorage.removeItem('googleAuthComplete');
      
      let errorMessage = 'Authentication failed: ';
      if (error.response) {
        switch (error.response.status) {
          case 400:
            errorMessage += 'Invalid authentication request';
            break;
          case 401:
            errorMessage += 'Unable to verify Google account';
            break;
          case 404:
            errorMessage += 'Google authentication service unavailable';
            break;
          case 500:
            errorMessage += 'Server error, please try again later';
            break;
          default:
            errorMessage += error.response.data?.message || 'Unknown error occurred';
        }
      } else if (error.request) {
        errorMessage += 'Unable to reach authentication server';
      } else {
        errorMessage += error.message || 'Unknown error occurred';
      }

      // Get the current environment for error redirect
      const isDevelopment = process.env.NODE_ENV === 'development';
      const baseUrl = isDevelopment ? 'http://localhost:3000' : FRONTEND_URL;
      
      // Only redirect if we're not already on the login or callback page
      const isLoginPage = window.location.pathname.includes('/login');
      const isCallbackPage = window.location.pathname.includes('/auth/callback');
      if (!isLoginPage && !isCallbackPage) {
        const loginUrl = new URL('/login', baseUrl);
        loginUrl.searchParams.set('error', errorMessage);
        window.location.replace(loginUrl.toString());
      }
      throw new Error(errorMessage);
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

  public getCurrentUser(): User | null {
    return this.user;
  }
}

// Create and export a singleton instance
const authService = AuthService.getInstance();
export default authService;