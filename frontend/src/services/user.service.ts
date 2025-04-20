import axios from 'axios';
import { API_URL } from '../config';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'student';
  isBlocked: boolean;
  isEmailVerified: boolean;
  lastLogin: string;
  createdAt: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  studentId?: string;
  course?: 'B.Tech' | 'M.Tech' | 'B.Sc' | 'M.Sc' | 'BBA' | 'MBA' | 'PhD' | 'Other';
  semester?: number;
  batch?: string;
  hostelBlock?: string;
  roomNumber?: string;
  notificationPreferences?: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  profileCompletion: number;
  lockUntil?: string;
  loginAttempts?: number;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  blockedUsers: number;
  lockedUsers: number;
  roleDistribution: {
    admin: number;
    student: number;
    user: number;
  };
  courseDistribution: Array<{
    _id: string;
    count: number;
  }>;
  batchDistribution: Array<{
    _id: string;
    count: number;
  }>;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  status?: string;
  course?: string;
  batch?: string;
}

export interface UserResponse {
  users: User[];
  totalPages: number;
  currentPage: number;
  totalUsers: number;
}

class UserService {
  private static instance: UserService;
  private baseUrl: string;

  private constructor() {
    this.baseUrl = `${API_URL}/users`;
  }

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  }

  async getAllUsers(filters: UserFilters): Promise<UserResponse> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });

      console.log('Making API request to:', `${this.baseUrl}?${params.toString()}`);
      const response = await axios.get(`${this.baseUrl}?${params.toString()}`, this.getAuthHeader());
      console.log('API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Error in getAllUsers:', error.response?.data || error.message);
      throw error;
    }
  }

  async getUserStatistics(): Promise<UserStatistics> {
    const response = await axios.get(`${this.baseUrl}/statistics`, this.getAuthHeader());
    return response.data;
  }

  async getUser(id: string): Promise<User> {
    const response = await axios.get(`${this.baseUrl}/${id}`, this.getAuthHeader());
    return response.data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const response = await axios.put(`${this.baseUrl}/${id}`, userData, this.getAuthHeader());
    return response.data.user;
  }

  async deleteUser(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/${id}`, this.getAuthHeader());
  }

  async toggleUserBlock(id: string): Promise<{ isBlocked: boolean }> {
    const response = await axios.patch(`${this.baseUrl}/${id}/block`, {}, this.getAuthHeader());
    return response.data;
  }

  async changeUserRole(id: string, role: User['role']): Promise<{ role: User['role'] }> {
    const response = await axios.patch(`${this.baseUrl}/${id}/role`, { role }, this.getAuthHeader());
    return response.data;
  }

  async unlockUserAccount(id: string): Promise<void> {
    await axios.patch(`${this.baseUrl}/${id}/unlock`, {}, this.getAuthHeader());
  }

  async resetUserPassword(id: string, newPassword: string): Promise<void> {
    await axios.patch(`${this.baseUrl}/${id}/reset-password`, { newPassword }, this.getAuthHeader());
  }
}

export default UserService.getInstance(); 