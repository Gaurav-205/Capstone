import axios, { AxiosError } from 'axios';
import { API_URL } from '../config';

// Update API URL to point to the backend server
const LOST_FOUND_API_URL = `${API_URL}/lost-found`;

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.headers.common['Content-Type'] = 'application/json';

// Add request interceptor to include auth token and check authentication
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    const isAuthEndpoint = config.url?.includes('/auth/');
    
    if (!token && !isAuthEndpoint) {
      // Redirect to login if no token and not an auth endpoint
      window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
      throw new Error('Authentication required');
    }
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

interface ErrorResponse {
  message?: string;
  errors?: string[];
}

// Add response interceptor for error handling
axios.interceptors.response.use(
  response => response,
  (error: AxiosError<ErrorResponse>) => {
    if (error.response) {
      // Handle specific error cases
      switch (error.response.status) {
        case 401:
          // Clear token and redirect to login on unauthorized
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login?redirect=' + encodeURIComponent(window.location.pathname);
          return Promise.reject(new Error('Your session has expired. Please log in again.'));
        
        case 403:
          return Promise.reject(new Error('You do not have permission to perform this action.'));
        
        case 404:
          return Promise.reject(new Error('The requested resource was not found.'));
        
        case 422:
          // Handle validation errors
          const validationErrors = error.response.data?.errors;
          if (validationErrors && Array.isArray(validationErrors)) {
            return Promise.reject(new Error(validationErrors.join(', ')));
          }
          return Promise.reject(new Error('Invalid data provided.'));
        
        case 429:
          return Promise.reject(new Error('Too many requests. Please try again later.'));
        
        case 500:
          return Promise.reject(new Error('An internal server error occurred. Please try again later.'));
        
        default:
          return Promise.reject(new Error(error.response.data?.message || 'An unexpected error occurred'));
      }
    } else if (error.request) {
      return Promise.reject(new Error('Unable to reach the server. Please check your internet connection.'));
    } else {
      return Promise.reject(new Error(error.message || 'An unexpected error occurred'));
    }
  }
);

export interface LostFoundItem {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  date: string;
  status: 'lost' | 'found';
  image?: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  isResolved: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface LostFoundFilters {
  status?: 'lost' | 'found';
  category?: string;
  location?: string;
  isResolved?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LostFoundStats {
  activeLostItems: number;
  activeFoundItems: number;
  resolvedItems: number;
  categoryDistribution: Array<{
    category: string;
    count: number;
  }>;
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// Helper function to handle API errors with better messages
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message: string; errors?: string[] }>;
    
    // Handle validation errors
    if (axiosError.response?.status === 422 && axiosError.response.data?.errors) {
      throw new Error(axiosError.response.data.errors.join(', '));
    }
    
    // Handle other errors
    throw new Error(
      axiosError.response?.data?.message ||
      axiosError.message ||
      'An unexpected error occurred'
    );
  }
  
  // Handle non-axios errors
  if (error instanceof Error) {
    throw error;
  }
  
  throw new Error('An unexpected error occurred');
};

const getLoggedInUserId = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  
  try {
    // JWT tokens are in the format: header.payload.signature
    const payload = token.split('.')[1];
    // Decode the base64 payload
    const decodedPayload = JSON.parse(atob(payload));
    return decodedPayload.id || decodedPayload.userId || null;
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

const RESOLVED_EXPIRY_HOURS = 24;
const NORMAL_EXPIRY_DAYS = 15;

const isItemExpired = (item: LostFoundItem): boolean => {
  const currentTime = new Date().getTime();
  const itemDate = new Date(item.updatedAt).getTime();
  
  if (item.isResolved) {
    // Check if resolved item is older than 24 hours
    const expiryTime = itemDate + (RESOLVED_EXPIRY_HOURS * 60 * 60 * 1000);
    return currentTime > expiryTime;
  } else {
    // Check if normal item is older than 15 days
    const expiryTime = itemDate + (NORMAL_EXPIRY_DAYS * 24 * 60 * 60 * 1000);
    return currentTime > expiryTime;
  }
};

export const lostFoundService = {
  // Helper function to check if current user owns an item
  isItemOwner: (item: LostFoundItem): boolean => {
    const currentUserId = getLoggedInUserId();
    if (!currentUserId) {
      return false;
    }
    return currentUserId === item.userId;
  },

  // Get items with filters
  getItems: async (filters: LostFoundFilters): Promise<ApiResponse<{ items: LostFoundItem[]; totalPages: number; totalItems: number }>> => {
    try {
      if (!localStorage.getItem('token')) {
        throw new Error('Authentication required');
      }

      const queryParams = new URLSearchParams();
      
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.location) queryParams.append('location', filters.location);
      if (typeof filters.isResolved === 'boolean') queryParams.append('isResolved', String(filters.isResolved));
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.page) queryParams.append('page', String(filters.page));
      if (filters.limit) queryParams.append('limit', String(filters.limit));

      const response = await axios.get(`${LOST_FOUND_API_URL}?${queryParams.toString()}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get single item
  getItemById: async (id: string): Promise<ApiResponse<LostFoundItem>> => {
    const response = await axios.get(`${LOST_FOUND_API_URL}/${id}`);
    return response.data;
  },

  // Create new item
  createItem: async (item: Omit<LostFoundItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<LostFoundItem>> => {
    try {
      if (!localStorage.getItem('token')) {
        throw new Error('Please log in to report an item');
      }

      // Validate required fields
      const requiredFields = ['title', 'category', 'location', 'status', 'contactName', 'contactEmail'];
      const missingFields = requiredFields.filter(field => !item[field as keyof typeof item]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(item.contactEmail)) {
        throw new Error('Please enter a valid email address');
      }

      // Validate phone number if provided
      if (item.contactPhone && !/^\d{10}$/.test(item.contactPhone)) {
        throw new Error('Phone number must be 10 digits');
      }

      const response = await axios.post(LOST_FOUND_API_URL, item);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Update item
  updateItem: async (id: string, item: Partial<LostFoundItem>): Promise<ApiResponse<LostFoundItem>> => {
    try {
      const response = await axios.put(`${LOST_FOUND_API_URL}/${id}`, item);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Delete item
  deleteItem: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    try {
      const response = await axios.delete(`${LOST_FOUND_API_URL}/${id}`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Mark item as resolved
  markResolved: async (id: string): Promise<ApiResponse<LostFoundItem>> => {
    try {
      const response = await axios.patch(`${LOST_FOUND_API_URL}/${id}/resolve`);
      return response.data;
    } catch (error) {
      return handleApiError(error);
    }
  },

  // Get statistics
  getStatistics: async (): Promise<{ data: LostFoundStats }> => {
    try {
      const response = await axios.get(`${LOST_FOUND_API_URL}/statistics`);
      return {
        data: {
          activeLostItems: response.data?.data?.activeLostItems || 0,
          activeFoundItems: response.data?.data?.activeFoundItems || 0,
          resolvedItems: response.data?.data?.resolvedItems || 0,
          categoryDistribution: response.data?.data?.categoryDistribution || []
        }
      };
    } catch (error) {
      console.error('Error fetching lost & found statistics:', error);
      return {
        data: {
          activeLostItems: 0,
          activeFoundItems: 0,
          resolvedItems: 0,
          categoryDistribution: []
        }
      };
    }
  },

  // Check if an item is expired
  isItemExpired: (item: LostFoundItem): boolean => {
    const createdDate = new Date(item.createdAt);
    const expiryDate = new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000); // 30 days from creation
    return new Date() > expiryDate;
  },

  // Add method to check if an item should be visible
  isItemVisible: (item: LostFoundItem): boolean => {
    return !lostFoundService.isItemExpired(item);
  }
}; 