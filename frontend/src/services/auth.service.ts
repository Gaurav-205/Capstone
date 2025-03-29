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

  private clearAuth() {
    this.token = null;
    this.user = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete axios.defaults.headers.common['Authorization'];
  }

  public async login(data: LoginData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, data);
      const { token, user } = response.data;
      if (!token || !user) {
        throw new Error('Invalid response from server');
      }
      this.setAuth(token, user);
      return response.data;
    } catch (error: any) {
      console.error('Login error:', error.response?.data || error);
      throw error;
    }
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
      localStorage.setItem('user', JSON.stringify(user));
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
    return !!this.token && !!this.user;
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
      // Store the token
      this.setAuth(token, { id: '', name: '', email: '', hasSetPassword: false });
      
      // Get the user data
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!response.data.user) {
        throw new Error('Failed to get user data');
      }

      // Update the auth state with the user data
      this.setAuth(token, response.data.user);
      return response.data;
    } catch (error: any) {
      console.error('Google callback error:', error.response?.data || error);
      this.clearAuth();
      throw error;
    }
  }
}

export default AuthService.getInstance(); 