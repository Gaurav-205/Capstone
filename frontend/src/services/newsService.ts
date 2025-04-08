import axios from 'axios';

// Define the News interface
export interface News {
  _id: string;
  title: string;
  content: string;
  date: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface NewsStatistics {
  total: number;
  highPriority: number;
  recentPublished: number;
}

const newsService = {
  getStatistics: async (): Promise<{ data: NewsStatistics }> => {
    try {
      const response = await axios.get(`${API_URL}/news/statistics`);
      // Ensure we're returning the correct structure
      return {
        data: {
          total: response.data?.data?.total || 0,
          highPriority: response.data?.data?.highPriority || 0,
          recentPublished: response.data?.data?.recentPublished || 0
        }
      };
    } catch (error) {
      console.error('Error fetching news statistics:', error);
      // Return default values if there's an error
      return {
        data: {
          total: 0,
          highPriority: 0,
          recentPublished: 0
        }
      };
    }
  },

  // Get all news
  getNews: async (): Promise<News[]> => {
    try {
      const response = await axios.get(`${API_URL}/news`);
      return response.data;
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  },

  // Get a single news
  getNewsItem: async (id: string): Promise<News | null> => {
    try {
      const response = await axios.get(`${API_URL}/news/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching news with id ${id}:`, error);
      return null;
    }
  },

  // Create a new news
  createNews: async (news: Omit<News, '_id' | 'createdAt' | 'updatedAt'>): Promise<News> => {
    try {
      const response = await axios.post(`${API_URL}/news`, news);
      return response.data;
    } catch (error) {
      console.error('Error creating news:', error);
      throw error;
    }
  },

  // Update a news
  updateNews: async (id: string, news: Partial<News>): Promise<News> => {
    try {
      const response = await axios.put(`${API_URL}/news/${id}`, news);
      return response.data;
    } catch (error) {
      console.error(`Error updating news with id ${id}:`, error);
      throw error;
    }
  },

  // Delete a news
  deleteNews: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/news/${id}`);
    } catch (error) {
      console.error(`Error deleting news with id ${id}:`, error);
      throw error;
    }
  },

  // Add other news-related methods here
};

export default newsService; 