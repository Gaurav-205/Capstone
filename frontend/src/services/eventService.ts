import axios from 'axios';

// Define the Event interface
export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: 'academic' | 'social' | 'sports' | 'cultural' | 'other';
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  registrationUrl?: string;
  isMultiDay?: boolean;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
}

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface EventStatistics {
  total: number;
  registered: number;
  upcoming: number;
}

const eventService = {
  getStatistics: async (): Promise<{ data: EventStatistics }> => {
    try {
      const response = await axios.get(`${API_URL}/events/statistics`);
      // Ensure we're returning the correct structure
      return {
        data: {
          total: response.data?.data?.total || 0,
          registered: response.data?.data?.registered || 0,
          upcoming: response.data?.data?.upcoming || 0
        }
      };
    } catch (error) {
      console.error('Error fetching event statistics:', error);
      // Return default values if there's an error
      return {
        data: {
          total: 0,
          registered: 0,
          upcoming: 0
        }
      };
    }
  },

  // Get all events
  getEvents: async (): Promise<Event[]> => {
    try {
      const response = await axios.get(`${API_URL}/events`);
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  },

  // Get a single event
  getEvent: async (id: string): Promise<Event | null> => {
    try {
      const response = await axios.get(`${API_URL}/events/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching event with id ${id}:`, error);
      return null;
    }
  },

  // Create a new event
  createEvent: async (event: Omit<Event, '_id' | 'createdAt' | 'updatedAt'>): Promise<Event> => {
    try {
      const response = await axios.post(`${API_URL}/events`, event);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  // Update an event
  updateEvent: async (id: string, event: Partial<Event>): Promise<Event> => {
    try {
      const response = await axios.put(`${API_URL}/events/${id}`, event);
      return response.data;
    } catch (error) {
      console.error(`Error updating event with id ${id}:`, error);
      throw error;
    }
  },

  // Delete an event
  deleteEvent: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/events/${id}`);
    } catch (error) {
      console.error(`Error deleting event with id ${id}:`, error);
      throw error;
    }
  },

  // Add other event-related methods here
};

export default eventService; 