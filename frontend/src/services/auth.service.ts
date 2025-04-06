import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.timeout = 30000; // 30 seconds default timeout

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // 2 seconds

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Add request logging
axios.interceptors.request.use(request => {
  console.log('Starting Request:', {
    url: request.url,
    method: request.method,
    headers: request.headers,
    data: request.data
  });
  return request;
});

// Add response logging
axios.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      headers: response.headers,
      data: response.data
    });
    return response;
  },
  error => {
    console.error('Response Error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
      code: error.code
    });
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

class AuthService {
  private static instance: AuthService;
  private token: string | null = null;
  private user: AuthResponse['user'] | null = null;
  private requestInterceptor: number | null = null;
  private responseInterceptor: number | null = null;

  private constructor() {
    // Initialize from localStorage
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
    // Remove existing interceptors if they exist
    if (this.requestInterceptor !== null) {
      axios.interceptors.request.eject(this.requestInterceptor);
    }
    if (this.responseInterceptor !== null) {
      axios.interceptors.response.eject(this.responseInterceptor);
    }

    // Request interceptor
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

    // Response interceptor
    this.responseInterceptor = axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          this.clearAuth();
          if (!window.location.pathname.includes('/login')) {
            window.location.href = `${FRONTEND_URL}/login?error=session_expired`;
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private setAuth(token: string, user: AuthResponse['user']) {
    try {
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      console.error('Error setting auth:', error);
      this.clearAuth();
    }
  }

  public initializeAuth() {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token) {
      this.token = token;
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      if (userStr) {
        try {
          this.user = JSON.parse(userStr);
        } catch (error) {
          console.error('Failed to parse user data:', error);
          this.clearAuth();
        }
      }
    }
  }

  public clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }

  public async login(data: LoginData): Promise<AuthResponse> {
    let lastError;
    
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`Login attempt ${attempt} of ${MAX_RETRIES}...`);
        console.log('Attempting login with API URL:', API_URL);
        
        // Check if the server is reachable
        try {
          await axios.options(`${API_URL}/auth/login`, { timeout: 5000 });
        } catch (error) {
          console.log('Server health check failed, retrying...');
          if (attempt < MAX_RETRIES) {
            await delay(RETRY_DELAY);
            continue;
          }
        }
        
        const response = await axios.post(`${API_URL}/auth/login`, data, {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          timeout: 30000 // 30 second timeout
        });
        
        console.log('Login response:', response.data);
        const { token, user } = response.data;
        
        if (!token || !user) {
          console.error('Invalid response structure:', response.data);
          throw new Error('Invalid response from server');
        }
        
        console.log('Setting auth with token and user:', { token: token.substring(0, 10) + '...', user });
        this.setAuth(token, user);
        return response.data;
      } catch (error: any) {
        lastError = error;
        console.error(`Login attempt ${attempt} failed:`, {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status,
          code: error.code
        });
        
        // If it's not a timeout error, or if it's the last attempt, don't retry
        if (error.code !== 'ECONNABORTED' && error.message !== 'timeout' || attempt === MAX_RETRIES) {
          break;
        }
        
        // Wait before retrying
        await delay(RETRY_DELAY);
      }
    }
    
    // If all attempts failed, throw the last error
    throw new Error(lastError?.response?.data?.message || lastError?.message || 'Failed to connect to server');
  }

  public async signup(data: SignupData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, data);
      const { token, user } = response.data;
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      this.setAuth(token, user);
      return response.data;
    } catch (error: any) {
      console.error('Signup error:', error.response?.data || error);
      throw error;
    }
  }

  public async getCurrentUser() {
    try {
      if (!this.token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${API_URL}/auth/me`);
      const { user } = response.data;
      if (!user) {
        throw new Error('Invalid response from server');
      }
      this.user = user;
      localStorage.setItem('user', JSON.stringify({
        ...user,
        role: user.role || 'user'
      }));
      return response.data;
    } catch (error: any) {
      console.error('Get current user error:', error.response?.data || error);
      this.clearAuth();
      throw error;
    }
  }

  public logout() {
    this.clearAuth();
    window.location.href = '/login';
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  public getToken(): string | null {
    return this.token;
  }

  public getUser() {
    return this.user;
  }

  public async forgotPassword(email: string): Promise<{ message: string }> {
    try {
      const response = await axios.post(`${API_URL}/auth/forgot-password`, { email });
      return response.data;
    } catch (error: any) {
      console.error('Forgot password error:', error.response?.data || error);
      throw error;
    }
  }

  public async resetPassword(token: string, password: string): Promise<{ message: string }> {
    try {
      const response = await axios.put(`${API_URL}/auth/reset-password/${token}`, { password });
      return response.data;
    } catch (error: any) {
      console.error('Reset password error:', error.response?.data || error);
      throw error;
    }
  }

  public async setPassword(password: string): Promise<{ message: string; user: AuthResponse['user'] }> {
    try {
      if (!this.token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(`${API_URL}/auth/set-password`, { password });
      if (response.data.user) {
        this.user = response.data.user;
        localStorage.setItem('user', JSON.stringify(this.user));
      }
      return response.data;
    } catch (error: any) {
      console.error('Set password error:', error.response?.data || error);
      throw error;
    }
  }

  public async handleGoogleCallback(token: string) {
    try {
      console.log('Starting Google callback handling...');
      
      // First, store the token
      this.token = token;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      // Get the user data
      console.log('Fetching user data...');
      const response = await axios.get(`${API_URL}/auth/me`);
      
      if (!response.data.user) {
        throw new Error('Failed to get user data');
      }
      
      // Update the auth state with the user data
      this.user = response.data.user;
      localStorage.setItem('user', JSON.stringify(this.user));
      
      console.log('Google callback completed successfully');
      return response.data;
    } catch (error: any) {
      console.error('Google callback error:', error.response?.data || error);
      this.clearAuth();
      throw new Error(error.response?.data?.message || 'Failed to complete authentication');
    }
  }
}

// Create and export the singleton instance
const authService = AuthService.getInstance();
export default authService; 