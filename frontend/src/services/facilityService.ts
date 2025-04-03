import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export interface FacilityStatistics {
  available: number;
  total: number;
  utilization: number;
}

const facilityService = {
  getStatistics: async (): Promise<{ data: FacilityStatistics }> => {
    try {
      const response = await axios.get(`${API_URL}/facilities/statistics`);
      // Ensure we're returning the correct structure
      return {
        data: {
          total: response.data?.data?.total || 0,
          available: response.data?.data?.available || 0,
          utilization: response.data?.data?.utilization || 0
        }
      };
    } catch (error) {
      console.error('Error fetching facility statistics:', error);
      // Return default values if there's an error
      return {
        data: {
          total: 0,
          available: 0,
          utilization: 0
        }
      };
    }
  },

  // Add other facility-related methods here
};

export default facilityService; 