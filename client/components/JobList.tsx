'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Job, PaginatedResponse } from '@/types';
import { api } from '@/lib/api';
import { formatDistanceToNow } from '@/lib/utils';
import { JobFilters } from './JobFilters';

interface JobListProps {
  limit?: number;
  showFilters?: boolean;
}

export function JobList({ limit, showFilters = false }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    q: '',
    location: '',
    minExperience: '',
    sort: 'createdAt:desc',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: limit || 10,
    total: 0,
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, filters]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response: PaginatedResponse<Job> = await api.getJobs({
        q: filters.q,
        location: filters.location,
        sort: filters.sort,
        page: 1,
        pageSize: 1000, // Get all jobs for client-side filtering
      });
      setJobs(response.items);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = [...jobs];

    // Apply text search
    if (filters.q) {
      const searchTerm = filters.q.toLowerCase();
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm) ||
        job.description.toLowerCase().includes(searchTerm)
      );
    }

    // Apply location filter
    if (filters.location) {
      const locationTerm = filters.location.toLowerCase();
      filtered = filtered.filter(job => 
        (job.location || 'remote').toLowerCase().includes(locationTerm)
      );
    }

    // Apply experience filter (parse from requirements)
    if (filters.minExperience) {
      const userExperience = parseInt(filters.minExperience);
      
      filtered = filtered.filter(job => {
        // Extract years from requirements text
        const reqText = (job.requirements || '').toLowerCase();
        
        // Match patterns like "5+ years", "3-5 years", "0-2 years", "minimum 3 years"
        const patterns = [
          /(\d+)\s*\+\s*years?/, // 5+ years
          /(\d+)\s*-\s*(\d+)\s*years?/, // 3-5 years
          /(\d+)\s*to\s*(\d+)\s*years?/, // 3 to 5 years
          /minimum\s*(\d+)\s*years?/, // minimum 3 years
          /at\s*least\s*(\d+)\s*years?/, // at least 3 years
          /(\d+)\s*years?\s*(?:of\s*)?experience/ // 5 years experience
        ];
        
        let minRequired = null;
        let maxRequired = null;
        
        for (const pattern of patterns) {
          const match = reqText.match(pattern);
          if (match) {
            minRequired = parseInt(match[1]);
            if (match[2]) {
              maxRequired = parseInt(match[2]);
            }
            break;
          }
        }
        
        // If no experience requirement found, include the job
        if (minRequired === null) return true;
        
        // Check if user's experience falls within the required range
        if (maxRequired !== null) {
          // Job has a range (e.g., 3-5 years)
          return userExperience >= minRequired && userExperience <= maxRequired;
        } else {
          // Job has minimum requirement (e.g., 5+ years)
          return userExperience >= minRequired;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const [field, order] = filters.sort.split(':');
      let comparison = 0;
      
      if (field === 'createdAt') {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (field === 'title') {
        comparison = a.title.localeCompare(b.title);
      }
      
      return order === 'desc' ? -comparison : comparison;
    });

    // Apply pagination
    const start = (pagination.page - 1) * pagination.pageSize;
    const paginatedJobs = filtered.slice(start, start + pagination.pageSize);
    
    setFilteredJobs(paginatedJobs);
    setPagination(prev => ({ ...prev, total: filtered.length }));
  };

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      {showFilters && (
        <JobFilters 
          onFiltersChange={handleFiltersChange}
          initialFilters={filters}
        />
      )}

      {filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">No jobs found</p>
        </div>
      ) : (
        <>
          <div className="grid gap-6">
            {filteredJobs.map((job) => (
              <Link
                key={job._id}
                href={`/jobs/${job._id}`}
                className="block bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer hover:border-blue-300 dark:hover:border-blue-700"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2 hover:text-blue-600 dark:hover:text-blue-400">
                      {job.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      {job.location || 'Remote'}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300 line-clamp-3">
                      {job.description}
                    </p>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(job.createdAt))} ago
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Deadline: {new Date(job.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!limit && pagination.total > pagination.pageSize && (
            <div className="mt-8 flex justify-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-4 py-2 text-gray-700 dark:text-gray-300">
                Page {pagination.page} of {Math.ceil(pagination.total / pagination.pageSize)}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page >= Math.ceil(pagination.total / pagination.pageSize)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}