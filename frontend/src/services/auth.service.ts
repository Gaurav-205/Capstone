import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || 'http://localhost:3000';

// Configure axios defaults
axios.defaults.withCredentials = true;
axios.defaults.timeout = 30000; // 30 seconds default timeout

// Retry configuration
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;
const HEALTH_CHECK_TIMEOUT = 10000;

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to check server health
const checkServerHealth = async () => {
  try {
    // Try a simple GET request to the root API endpoint
    const response = await axios.get(`${API_URL}`, {
      timeout: HEALTH_CHECK_TIMEOUT
    });
    return response.status === 200;
  } catch (error: any) {
    console.log('Server health check failed:', error.message);
    return false;
  }
};

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

  private clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }

  public async login(loginData: LoginData): Promise<AuthResponse> {
    let retryCount = 0;
    while (retryCount < MAX_RETRIES) {
      try {
        // Check server health before attempting login
        const isHealthy = await checkServerHealth();
        if (!isHealthy) {
          console.log(`Server health check failed, attempt ${retryCount + 1}/${MAX_RETRIES}`);
          await delay(RETRY_DELAY);
          retryCount++;
          continue;
        }

        const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, loginData);
        const { token, user } = response.data;
        this.setAuth(token, user);
        return response.data;
      } catch (error: any) {
        if (retryCount === MAX_RETRIES - 1) {
          throw new Error(
            `Login failed after ${MAX_RETRIES} attempts. ${error.response?.data?.message || error.message}`
          );
        }
        console.log(`Login attempt ${retryCount + 1} failed, retrying...`);
        await delay(RETRY_DELAY);
        retryCount++;
      }
    }
    throw new Error('Login failed: Maximum retry attempts exceeded');
  }

  public async logout(): Promise<void> {
    try {
      await axios.post(`${API_URL}/auth/logout`);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
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