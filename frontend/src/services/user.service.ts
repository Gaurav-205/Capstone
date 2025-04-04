import axios from 'axios';
import { API_URL } from '../config';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'student';
  isBlocked: boolean;
  createdAt: string;
  lastLogin: string;
}

export interface UserResponse {
  users: User[];
  totalPages: number;
  currentPage: number;
}

class UserService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json'
      }
    };
  }

  async getAllUsers(page: number = 1, limit: number = 10, search?: string, role?: string, status?: string): Promise<UserResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
        ...(role && { role }),
        ...(status && { status }),
      });

      const response = await axios.get(`${API_URL}/users?${params}`, this.getAuthHeader());
      console.log('Users response:', response.data); // Debug log
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  }

  async getUser(id: string): Promise<User> {
    const response = await axios.get(`${API_URL}/users/${id}`, this.getAuthHeader());
    return response.data;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User> {
    const response = await axios.put(`${API_URL}/users/${id}`, data, this.getAuthHeader());
    return response.data.user;
  }

  async deleteUser(id: string): Promise<void> {
    await axios.delete(`${API_URL}/users/${id}`, this.getAuthHeader());
  }

  async toggleUserBlock(id: string): Promise<{ isBlocked: boolean }> {
    const response = await axios.patch(`${API_URL}/users/${id}/toggle-block`, {}, this.getAuthHeader());
    return response.data;
  }

  async changeUserRole(id: string, role: User['role']): Promise<{ role: User['role'] }> {
    const response = await axios.patch(
      `${API_URL}/users/${id}/change-role`,
      { role },
      this.getAuthHeader()
    );
    return response.data;
  }
}

export const userService = new UserService(); 