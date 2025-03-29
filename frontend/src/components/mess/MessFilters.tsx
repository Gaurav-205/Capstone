import React from 'react';

interface Filters {
  isOpen: boolean;
  type: string;
  minRating: number;
}

interface MessFiltersProps {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
}

const MessFilters: React.FC<MessFiltersProps> = ({ filters, onFilterChange }) => {
  const handleChange = (field: keyof Filters, value: any) => {
    onFilterChange({
      ...filters,
      [field]: value
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Filters</h2>
      
      <div className="space-y-4">
        <div>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={filters.isOpen}
              onChange={(e) => handleChange('isOpen', e.target.checked)}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <span>Open Now</span>
          </label>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={filters.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">All</option>
            <option value="mess">Mess Hall</option>
            <option value="canteen">Canteen</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Minimum Rating
          </label>
          <select
            value={filters.minRating}
            onChange={(e) => handleChange('minRating', Number(e.target.value))}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="0">Any Rating</option>
            <option value="4">4+ Stars</option>
            <option value="3">3+ Stars</option>
            <option value="2">2+ Stars</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default MessFilters; 