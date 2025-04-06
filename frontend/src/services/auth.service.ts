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
      if (this.token) {
        try {
          // Use GET request for logout
          await axios.get(`${API_URL}/auth/logout`, {
            headers: { Authorization: `Bearer ${this.token}` }
          });
          console.log('Server logout successful');
        } catch (error: any) {
          // Log but don't throw - we'll still clear local state
          console.log('Server logout failed (this is expected if session expired):', error.message);
        }
      }
    } finally {
      // Clear local state
      this.clearAuth();
      
      // Remove all axios interceptors
      if (this.requestInterceptor !== null) {
        axios.interceptors.request.eject(this.requestInterceptor);
      }
      if (this.responseInterceptor !== null) {
        axios.interceptors.response.eject(this.responseInterceptor);
      }
      
      // Reset axios defaults
      delete axios.defaults.headers.common['Authorization'];
      
      // Redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = `${FRONTEND_URL}/login?message=logged_out`;
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
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
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

  public async handleGoogleCallback(token: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/auth/google/callback`, { token });
      const { token: authToken, user } = response.data;
      this.setAuth(authToken, user);
      return response.data;
    } catch (error: any) {
      throw new Error(`Google authentication failed: ${error.response?.data?.message || error.message}`);
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
      const response = await axios.post<SetPasswordResponse>(`${API_URL}/auth/set-password`, {
        password
      }, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      return response.data;
    } catch (error: any) {
      throw new Error(`Setting password failed: ${error.response?.data?.message || error.message}`);
    }
  }

  public getCurrentUser(): AuthResponse['user'] | null {
    return this.user;
  }
}

// Create and export a singleton instance
const authService = AuthService.getInstance();
export default authService;