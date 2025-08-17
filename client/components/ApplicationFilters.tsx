'use client';

import { ApplicationStatus } from '@/types';

interface ApplicationFiltersProps {
  filters: {
    status: ApplicationStatus | 'ALL';
    jobTitle: string;
  };
  onFiltersChange: (filters: any) => void;
  jobTitles: string[];
}

export function ApplicationFilters({ filters, onFiltersChange, jobTitles }: ApplicationFiltersProps) {
  const statuses: (ApplicationStatus | 'ALL')[] = ['ALL', 'APPLIED', 'UNDER_REVIEW', 'INTERVIEW', 'OFFER', 'REJECTED'];

  const handleFilterChange = (key: string, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = filters.status !== 'ALL' || filters.jobTitle;

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-6 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Filter Applications</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Filter */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Application Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {statuses.map(status => (
              <option key={status} value={status}>
                {status === 'ALL' ? 'All Statuses' : status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Job Title Filter */}
        <div>
          <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Job Position
          </label>
          <select
            id="jobTitle"
            value={filters.jobTitle}
            onChange={(e) => handleFilterChange('jobTitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Positions</option>
            {jobTitles.map(title => (
              <option key={title} value={title}>
                {title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Clear Filters Button */}
      {hasActiveFilters && (
        <div className="mt-4">
          <button
            onClick={() => onFiltersChange({
              status: 'ALL',
              jobTitle: ''
            })}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}