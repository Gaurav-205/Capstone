import axios from 'axios';

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

  // Add other event-related methods here
};

export default eventService; 