import axios, { AxiosError } from 'axios';

// Update API URL to point to the backend server
const API_URL = 'http://localhost:5000/api/lost-found';

// Configure axios defaults
axios.defaults.baseURL = 'http://localhost:5000';
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

// Add response interceptor for error handling
axios.interceptors.response.use(
  response => response,
  (error: AxiosError) => {
    if (error.response) {
      // Handle 401 Unauthorized errors
      if (error.response.status === 401) {
        // Redirect to login or handle unauthorized access
        window.location.href = '/login';
      }
      console.error('Response Error:', error.response.data);
      return Promise.reject(error.response.data);
    } else if (error.request) {
      console.error('Request Error:', error.request);
      return Promise.reject({ message: 'No response from server' });
    } else {
      console.error('Error:', error.message);
      return Promise.reject({ message: error.message });
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
  status?: string;
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
    _id: string;
    count: number;
  }>;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  errors?: string[];
}

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
    console.log('Ownership check:', {
      itemId: item.id,
      itemUserId: item.userId,
      currentUserId: currentUserId,
      token: localStorage.getItem('token'),
      isMatch: currentUserId === item.userId
    });
    return currentUserId === item.userId;
  },

  // Get all items with filtering
  getItems: async (filters: LostFoundFilters): Promise<ApiResponse<{
    items: LostFoundItem[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
  }>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, value.toString());
      }
    });
    const response = await axios.get(`${API_URL}?${params.toString()}`);
    
    // Filter out expired items on the frontend
    const filteredItems = response.data.data.items.filter((item: LostFoundItem) => !isItemExpired(item));
    
    // Update pagination numbers based on filtered items
    const totalItems = filteredItems.length;
    const itemsPerPage = filters.limit || 9;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const currentPage = Math.min(filters.page || 1, totalPages);
    const start = (currentPage - 1) * itemsPerPage;
    const paginatedItems = filteredItems.slice(start, start + itemsPerPage);

    return {
      data: {
        items: paginatedItems,
        currentPage,
        totalPages,
        totalItems
      }
    };
  },

  // Get single item
  getItemById: async (id: string): Promise<ApiResponse<LostFoundItem>> => {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Create new item
  createItem: async (item: Omit<LostFoundItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<LostFoundItem>> => {
    console.log('Creating item with userId:', localStorage.getItem('userId'));
    const response = await axios.post(API_URL, item);
    console.log('Create item response from server:', response.data);
    return response.data;
  },

  // Update item
  updateItem: async (id: string, item: Partial<LostFoundItem>): Promise<ApiResponse<LostFoundItem>> => {
    const response = await axios.put(`${API_URL}/${id}`, item);
    return response.data;
  },

  // Delete item
  deleteItem: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  },

  // Mark item as resolved
  markResolved: async (id: string): Promise<ApiResponse<LostFoundItem>> => {
    const response = await axios.patch(`${API_URL}/${id}/resolve`);
    return response.data;
  },

  // Get statistics
  getStatistics: async (): Promise<{ data: LostFoundStats }> => {
    try {
      const response = await axios.get(`${API_URL}/statistics`);
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

  // Add method to check if an item should be visible
  isItemVisible: (item: LostFoundItem): boolean => {
    return !isItemExpired(item);
  }
}; 