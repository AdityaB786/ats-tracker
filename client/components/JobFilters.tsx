'use client';

import { useState, useEffect } from 'react';

interface JobFiltersProps {
  onFiltersChange: (filters: {
    q: string;
    location: string;
    minExperience: string;
    sort: string;
  }) => void;
  initialFilters?: {
    q: string;
    location: string;
    minExperience: string;
    sort: string;
  };
}

export function JobFilters({ onFiltersChange, initialFilters }: JobFiltersProps) {
  const [filters, setFilters] = useState({
    q: '',
    location: '',
    minExperience: '',
    sort: 'createdAt:desc',
    ...initialFilters
  });

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange(filters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      q: '',
      location: '',
      minExperience: '',
      sort: 'createdAt:desc'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.q || filters.location || filters.minExperience;

  return (
    <form onSubmit={handleSearch} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Search by role/title */}
        <div>
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Search by Role/Title
          </label>
          <input
            type="text"
            id="search"
            placeholder="e.g., Software Engineer, Data Scientist"
            value={filters.q}
            onChange={(e) => handleFilterChange('q', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Location filter */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Location
          </label>
          <input
            type="text"
            id="location"
            placeholder="e.g., Bangalore, Mumbai, Remote"
            value={filters.location}
            onChange={(e) => handleFilterChange('location', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Sort order */}
        <div>
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sort By
          </label>
          <select
            id="sort"
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="createdAt:desc">Latest First</option>
            <option value="createdAt:asc">Oldest First</option>
            <option value="title:asc">Title A-Z</option>
            <option value="title:desc">Title Z-A</option>
          </select>
        </div>

        {/* Min Experience */}
        <div>
          <label htmlFor="minExperience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Your Experience (years)
          </label>
          <input
            type="number"
            id="minExperience"
            placeholder="Enter your years of experience"
            min="0"
            step="1"
            value={filters.minExperience}
            onChange={(e) => handleFilterChange('minExperience', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Shows jobs matching your experience level
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-6">
        <div className="flex gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700"
          >
            Apply Filters
          </button>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-gray-600 dark:text-gray-400 px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Clear Filters
            </button>
          )}
        </div>
        {hasActiveFilters && (
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Filters active
          </span>
        )}
      </div>
    </form>
  );
}