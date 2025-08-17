'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Application, PaginatedResponse, ApplicationStatus } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/Navbar';
import { ApplicationFilters } from '@/components/ApplicationFilters';
import Link from 'next/link';

const statusColors = {
  APPLIED: 'bg-blue-100 text-blue-800',
  UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
  INTERVIEW: 'bg-purple-100 text-purple-800',
  OFFER: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {} as Record<string, number>,
  });
  const [filters, setFilters] = useState({
    status: 'ALL' as ApplicationStatus | 'ALL',
    jobTitle: ''
  });
  const [uniqueJobTitles, setUniqueJobTitles] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user?.role === 'recruiter') {
      router.push('/recruiter/jobs');
    } else if (user) {
      fetchApplications();
    }
  }, [user, authLoading]);

  const fetchApplications = async () => {
    try {
      const response: PaginatedResponse<Application> = await api.getMyApplications();
      setApplications(response.items);
      
      // Extract unique job titles
      const titles = [...new Set(response.items
        .map(app => (app.jobId as any).title)
        .filter(title => title)
      )] as string[];
      setUniqueJobTitles(titles.sort());
      
      // Calculate stats
      const byStatus = response.items.reduce((acc, app) => {
        acc[app.status] = (acc[app.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      setStats({
        total: response.total,
        byStatus,
      });
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters
    let filtered = [...applications];

    // Filter by status
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(app => app.status === filters.status);
    }

    // Filter by job title
    if (filters.jobTitle) {
      filtered = filtered.filter(app => (app.jobId as any).title === filters.jobTitle);
    }

    setFilteredApplications(filtered);
  }, [applications, filters]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          My Applications
        </h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Total Applications
            </h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              In Progress
            </h3>
            <p className="text-3xl font-bold text-yellow-600">
              {(stats.byStatus.UNDER_REVIEW || 0) + (stats.byStatus.INTERVIEW || 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Offers Received
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {stats.byStatus.OFFER || 0}
            </p>
          </div>
        </div>

        {/* Filters */}
        <ApplicationFilters
          filters={filters}
          onFiltersChange={setFilters}
          jobTitles={uniqueJobTitles}
        />

        {/* Applications List */}
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {applications.length === 0 
                ? "You haven't applied to any jobs yet"
                : "No applications match your filters"
              }
            </p>
            {applications.length === 0 ? (
              <Link
                href="/jobs"
                className="text-blue-600 hover:underline"
              >
                Browse available jobs
              </Link>
            ) : (
              <button
                onClick={() => setFilters({ status: 'ALL', jobTitle: '' })}
                className="text-blue-600 hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Applied Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredApplications.map((application) => {
                  const job = application.jobId as any;
                  return (
                    <tr key={application._id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/jobs/${job._id}`}
                          className="text-blue-600 hover:underline"
                        >
                          {job.title}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-300">
                        {job.location || 'Remote'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[application.status]}`}>
                          {application.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-600 dark:text-gray-400">
                        {new Date(application.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}