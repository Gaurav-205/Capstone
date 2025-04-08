import axios from 'axios';
import { API_URL } from '../config';

export interface SupportStatistics {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
}

export const getStatistics = async (): Promise<{ data: SupportStatistics }> => {
  try {
    const response = await axios.get(`${API_URL}/support/statistics`);
    return {
      data: {
        total: response.data?.data?.total || 0,
        open: response.data?.data?.open || 0,
        inProgress: response.data?.data?.inProgress || 0,
        resolved: response.data?.data?.resolved || 0,
        closed: response.data?.data?.closed || 0
      }
    };
  } catch (error) {
    console.error('Error fetching support statistics:', error);
    return {
      data: {
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        closed: 0
      }
    };
  }
}; 