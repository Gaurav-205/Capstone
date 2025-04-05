import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MessCard from '../components/mess/MessCard';
import MessFilters from '../components/mess/MessFilters';
import { Mess } from '../types/mess';

const MessPage: React.FC = () => {
  const [messes, setMesses] = useState<Mess[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    isOpen: false,
    type: '',
    minRating: 0
  });
  const navigate = useNavigate();

  const fetchMesses = useCallback(async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.isOpen) queryParams.append('isOpen', 'true');
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.minRating) queryParams.append('minRating', filters.minRating.toString());

      const response = await axios.get(`/api/mess/filter/search?${queryParams}`);
      setMesses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching mess halls:', error);
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchMesses();
  }, [fetchMesses]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">KampusKart Mess & Canteen System</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <MessFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>
        
        <div className="md:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {messes.map((mess) => (
              <MessCard
                key={mess._id}
                mess={mess}
                onClick={() => navigate(`/mess/${mess._id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessPage; 