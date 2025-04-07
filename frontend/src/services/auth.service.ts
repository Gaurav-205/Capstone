import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'https://kampuskart.onrender.com/api';
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.timeout = 30000; // 30 seconds default timeout
axios.defaults.headers.common['Content-Type'] = 'application/json';

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

export interface ResetPasswordResponse {
  success: boolean;
  message: string;
}

export interface SetPasswordResponse {
  success: boolean;
  message: string;
}

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: AuthResponse['user'] | null = null;
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
          // Clear auth and redirect only if not already on login page and not trying to login
          const isLoginRequest = error.config.url.includes('/login');
          if (!isLoginRequest && !window.location.pathname.includes('/login')) {
            this.clearAuth();
            window.location.href = `${FRONTEND_URL}/login?error=session_expired`;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  public async login(loginData: LoginData): Promise<AuthResponse> {
    console.log('Starting login process...');
    let retryCount = 0;
    let lastError: any = null;

    while (retryCount < MAX_RETRIES) {
      try {
        console.log(`Attempting login (attempt ${retryCount + 1}/${MAX_RETRIES})...`);
        
        // First clear any existing auth
        this.clearAuth();
        
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

        if (error.response?.status === 401) {
          throw new Error('Invalid email or password');
        }

        if (error.response?.status === 404) {
          throw new Error('Login service not available');
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

    throw new Error(
      lastError?.response?.data?.message || 
      lastError?.message || 
      'Unable to connect to the server. Please check your internet connection and try again.'
    );
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
      if (!window.location.pathname.includes('/login')) {
        window.location.replace(`${FRONTEND_URL}/login?message=logged_out`);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      // Force logout even if there's an error
      localStorage.clear();
      if (!window.location.pathname.includes('/login')) {
        window.location.replace(`${FRONTEND_URL}/login?error=logout_error`);
      }
    }
  }

  private setAuth(token: string, user: AuthResponse['user']) {
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

  public getUser(): AuthResponse['user'] | null {
    return this.user;
  }

  public isAuthenticated(): boolean {
    return !!this.token && !!this.user;
  }

  public async handleGoogleCallback(token: string): Promise<void> {
    try {
      console.log('Handling Google callback with token');
      
      if (!token) {
        throw new Error('Authentication failed: No token received from Google');
      }

      // Set the token directly since it's already a JWT from our backend
      this.token = token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get user data using the token
      const response = await axios.get(`${API_URL}/auth/me`);
      
      if (!response.data) {
        throw new Error('Authentication failed: Unable to retrieve user information');
      }

      // Set auth state with token and user data
      this.setAuth(token, response.data);
      
      // Check if user needs to set password
      if (!response.data.hasSetPassword) {
        console.log('User needs to set password, redirecting to password setup');
        window.location.replace(`${FRONTEND_URL}/set-password`);
      } else {
        console.log('Google authentication successful, redirecting to dashboard');
        window.location.replace(`${FRONTEND_URL}/dashboard`);
      }
    } catch (error: any) {
      console.error('Google authentication error:', error);
      this.clearAuth();
      
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

      window.location.replace(`${FRONTEND_URL}/login?error=${encodeURIComponent(errorMessage)}`);
      throw new Error(errorMessage);
    }
  }

  public async signup(signupData: SignupData): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/signup`, signupData);
      const { token, user } = response.data;
      this.setAuth(token, user);
      return response.data;
    } catch (error: any) {
      throw new Error(`Signup failed: ${error.response?.data?.message || error.message}`);
    }
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

  public getCurrentUser(): AuthResponse['user'] | null {
    return this.user;
  }
}

// Create and export a singleton instance
const authService = AuthService.getInstance();
export default authService;