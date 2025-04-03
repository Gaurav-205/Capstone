import axios from 'axios';
import { API_URL } from '../config';

export interface Feedback {
  _id: string;
  type: 'complaint' | 'suggestion' | 'feedback';
  category: 'academic' | 'facilities' | 'harassment' | 'other';
  title: string;
  description: string;
  isAnonymous: boolean;
  attachments: Array<{
    filename: string;
    url: string;
    mimetype: string;
  }>;
  status: 'pending' | 'in_progress' | 'resolved' | 'closed';
  referenceNumber: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  expectedResolutionDate?: Date;
  resolution?: {
    description: string;
    resolvedBy: string;
    resolvedAt: Date;
  };
  userRating?: {
    rating: number;
    comment: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeedbackData {
  type: Feedback['type'];
  category: Feedback['category'];
  title: string;
  description: string;
  isAnonymous: boolean;
  priority: Feedback['priority'];
  attachments: Array<{
    file: File;
    filename: string;
    mimetype: string;
  }>;
}

export interface UpdateFeedbackData extends Omit<CreateFeedbackData, 'attachments'> {
  attachments?: Array<{
    file: File;
    filename: string;
    mimetype: string;
  }>;
}

interface FeedbackStatistics {
  pending: number;
  total: number;
  resolved: number;
}

const feedbackService = {
  createFeedback: async (data: CreateFeedbackData): Promise<Feedback> => {
    const formData = new FormData();
    
    // Append text fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'attachments') {
        formData.append(key, value.toString());
      }
    });

    // Append attachments
    data.attachments.forEach((attachment, index) => {
      formData.append(`attachments`, attachment.file);
    });

    const response = await axios.post(`${API_URL}/feedback`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateFeedback: async (id: string, data: UpdateFeedbackData): Promise<Feedback> => {
    const formData = new FormData();
    
    // Append text fields
    Object.entries(data).forEach(([key, value]) => {
      if (key !== 'attachments') {
        formData.append(key, value.toString());
      }
    });

    // Append new attachments if any
    if (data.attachments) {
      data.attachments.forEach((attachment, index) => {
        formData.append(`attachments`, attachment.file);
      });
    }

    const response = await axios.put(`${API_URL}/feedback/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteFeedback: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/feedback/${id}`);
  },

  getUserFeedback: async (): Promise<Feedback[]> => {
    const response = await axios.get(`${API_URL}/feedback`);
    return response.data;
  },

  getFeedbackById: async (id: string): Promise<Feedback> => {
    const response = await axios.get(`${API_URL}/feedback/${id}`);
    return response.data;
  },

  updateFeedbackStatus: async (id: string, status: Feedback['status']): Promise<Feedback> => {
    const response = await axios.patch(`${API_URL}/feedback/${id}/status`, { status });
    return response.data;
  },

  submitResolution: async (id: string, resolution: Feedback['resolution']): Promise<Feedback> => {
    const response = await axios.post(`${API_URL}/feedback/${id}/resolve`, resolution);
    return response.data;
  },

  rateResolution: async (id: string, rating: Feedback['userRating']): Promise<Feedback> => {
    const response = await axios.post(`${API_URL}/feedback/${id}/rate`, rating);
    return response.data;
  },

  getStatistics: async (): Promise<{ data: FeedbackStatistics }> => {
    try {
      const response = await axios.get(`${API_URL}/feedback/statistics`);
      return {
        data: {
          total: response.data?.data?.total || 0,
          pending: response.data?.data?.pending || 0,
          resolved: response.data?.data?.resolved || 0
        }
      };
    } catch (error) {
      console.error('Error fetching feedback statistics:', error);
      return {
        data: {
          total: 0,
          pending: 0,
          resolved: 0
        }
      };
    }
  }
};

export default feedbackService; 