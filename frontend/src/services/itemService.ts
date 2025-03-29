import axios from 'axios';
import authService from './auth.service';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// No need for getAuthHeader since we're using axios interceptors now

export interface Item {
  _id: string;
  title: string;
  description: string;
  category: 'lost' | 'found';
  status: 'active' | 'resolved' | 'claimed';
  location: string;
  date: string;
  images: string[];
  postedBy: {
    _id: string;
    name: string;
    email: string;
  };
  claimedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  contactInfo: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemData {
  title: string;
  description: string;
  category: 'lost' | 'found';
  location: string;
  date: string;
  contactInfo: string;
  status?: 'active' | 'resolved' | 'claimed';
  images?: string[];
}

interface User {
  id: string;
  _id?: string; // Make _id optional since we'll use id as the primary identifier
  name: string;
  email: string;
  hasSetPassword?: boolean;
}

class ItemService {
  private static instance: ItemService;

  private constructor() {}

  public static getInstance(): ItemService {
    if (!ItemService.instance) {
      ItemService.instance = new ItemService();
    }
    return ItemService.instance;
  }

  private validateDate(date: string): boolean {
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  }

  public async getAllItems(): Promise<Item[]> {
    try {
      const response = await axios.get(`${API_URL}/items`);
      return response.data;
    } catch (error: any) {
      console.error('Get items error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to fetch items');
    }
  }

  public async getItemsByCategory(category: 'lost' | 'found'): Promise<Item[]> {
    try {
      if (!['lost', 'found'].includes(category)) {
        throw new Error('Invalid category');
      }
      const response = await axios.get(`${API_URL}/items/category/${category}`);
      return response.data;
    } catch (error: any) {
      console.error('Get items by category error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to fetch items by category');
    }
  }

  public async createItem(itemData: CreateItemData): Promise<Item> {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error('You must be logged in to create an item');
      }

      // Validate required fields
      const requiredFields = ['title', 'description', 'category', 'location', 'date', 'contactInfo'] as const;
      for (const field of requiredFields) {
        if (!itemData[field]?.toString().trim()) {
          throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
      }

      // Validate category
      if (!['lost', 'found'].includes(itemData.category)) {
        throw new Error('Invalid category');
      }

      // Validate and format date
      if (!this.validateDate(itemData.date)) {
        throw new Error('Invalid date format');
      }
      const formattedDate = new Date(itemData.date).toISOString().split('T')[0];

      // Prepare item data with defaults
      const preparedData = {
        ...itemData,
        date: formattedDate,
        status: 'active' as const,
        images: itemData.images || []
      };

      const response = await axios.post(`${API_URL}/items`, preparedData);
      return response.data;
    } catch (error: any) {
      console.error('Create item error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to create item');
    }
  }

  public async updateItemStatus(id: string, status: Item['status']): Promise<Item> {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error('You must be logged in to update an item');
      }

      if (!id?.trim()) {
        throw new Error('Item ID is required');
      }

      if (!['active', 'resolved', 'claimed'].includes(status)) {
        throw new Error('Invalid status');
      }

      // Get the item first to check if it can be updated
      const response = await axios.get(`${API_URL}/items/${id}`);
      const item = response.data;

      const user = authService.getUser() as User;
      if (!user) {
        throw new Error('User not found');
      }

      // Only allow status updates by the owner, except for claiming
      if (status !== 'claimed' && item.postedBy._id !== user._id) {
        throw new Error('You can only update your own items');
      }

      // Don't allow claiming if the item is already claimed
      if (status === 'claimed' && item.status === 'claimed') {
        throw new Error('This item has already been claimed');
      }

      // Ensure proper headers are set
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authService.getToken()}`
        }
      };

      const updateResponse = await axios.patch(
        `${API_URL}/items/${id}/status`,
        { status },
        config
      );
      
      return updateResponse.data;
    } catch (error: any) {
      console.error('Update item status error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update item status');
    }
  }

  public async deleteItem(id: string): Promise<void> {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error('You must be logged in to delete items');
      }

      if (!id?.trim()) {
        throw new Error('Item ID is required');
      }

      // Get the item first to check ownership
      const response = await axios.get(`${API_URL}/items/${id}`);
      const item = response.data;

      // Check if item and postedBy exist
      if (!item || !item.postedBy || !item.postedBy._id) {
        throw new Error('Invalid item data received from server');
      }

      const user = authService.getUser() as User;
      if (!user) {
        throw new Error('User not found');
      }

      // Use user.id since that's what's guaranteed to be available from auth service
      const userId = user.id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      // Compare IDs as strings
      const itemOwnerId = item.postedBy._id.toString();
      const currentUserId = userId.toString();

      if (itemOwnerId !== currentUserId) {
        throw new Error('You can only delete your own items');
      }

      await axios.delete(`${API_URL}/items/${id}`);
    } catch (error: any) {
      console.error('Delete item error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete item');
    }
  }

  public async getUserItems(): Promise<Item[]> {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error('You must be logged in to view your items');
      }

      const user = authService.getUser() as User;
      if (!user) {
        throw new Error('User not found');
      }

      // Use user.id since that's what's guaranteed to be available from auth service
      const userId = user.id;
      if (!userId) {
        throw new Error('User ID not found');
      }

      const allItems = await this.getAllItems();
      return allItems.filter(item => item.postedBy._id.toString() === userId.toString());
    } catch (error: any) {
      console.error('Get user items error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to fetch user items');
    }
  }

  public async updateItem(id: string, itemData: Partial<CreateItemData>): Promise<Item> {
    try {
      if (!authService.isAuthenticated()) {
        throw new Error('You must be logged in to update an item');
      }

      if (!id?.trim()) {
        throw new Error('Item ID is required');
      }

      // Validate required fields
      const requiredFields = ['title', 'description', 'location', 'date', 'contactInfo'] as const;
      for (const field of requiredFields) {
        if (!itemData[field]?.toString().trim()) {
          throw new Error(`${field.charAt(0).toUpperCase() + field.slice(1)} is required`);
        }
      }

      // Validate and format date if provided
      if (itemData.date && !this.validateDate(itemData.date)) {
        throw new Error('Invalid date format');
      }

      const formattedData = {
        ...itemData,
        date: itemData.date ? new Date(itemData.date).toISOString().split('T')[0] : undefined
      };

      const response = await axios.put(`${API_URL}/items/${id}`, formattedData);
      return response.data;
    } catch (error: any) {
      console.error('Update item error:', error.response?.data || error);
      throw new Error(error.response?.data?.message || error.message || 'Failed to update item');
    }
  }
}

export default ItemService.getInstance(); 