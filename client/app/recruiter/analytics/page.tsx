'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import { AnalyticsSummary } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/Navbar';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

export default function RecruiterAnalyticsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user?.role === 'applicant') {
      router.push('/dashboard');
    } else if (user) {
      fetchAnalytics();
    }
  }, [user, authLoading]);

  const fetchAnalytics = async () => {
    try {
      const data = await api.getAnalyticsSummary();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

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

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <p className="text-center text-gray-600 dark:text-gray-400">
            No analytics data available
          </p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const applicantsPerJobData = {
    labels: analytics.perJobCounts.map(item => item.title),
    datasets: [
      {
        label: 'Number of Applicants',
        data: analytics.perJobCounts.map(item => item.count),
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderColor: 'rgb(59, 130, 246)',
        borderWidth: 1,
      },
    ],
  };

  const avgExperienceData = {
    labels: analytics.avgExperiencePerJob.map(item => item.title),
    datasets: [
      {
        label: 'Average Experience (years)',
        data: analytics.avgExperiencePerJob.map(item => item.avgExperience),
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 1,
      },
    ],
  };

  const statusDistributionData = {
    labels: Object.keys(analytics.statusDistribution),
    datasets: [
      {
        label: 'Applications by Status',
        data: Object.values(analytics.statusDistribution),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)', // APPLIED - blue
          'rgba(251, 191, 36, 0.8)', // UNDER_REVIEW - yellow
          'rgba(168, 85, 247, 0.8)', // INTERVIEW - purple
          'rgba(34, 197, 94, 0.8)',  // OFFER - green
          'rgba(239, 68, 68, 0.8)',  // REJECTED - red
        ],
        borderWidth: 1,
      },
    ],
  };


  const chartOptions: ChartOptions<any> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: 'rgb(156, 163, 175)',
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
      },
      y: {
        ticks: {
          color: 'rgb(156, 163, 175)',
        },
        grid: {
          color: 'rgba(156, 163, 175, 0.1)',
        },
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Recruitment Analytics
        </h1>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Unique Applicants
            </h3>
            <p className="text-3xl font-bold text-blue-600">
              {analytics.totalApplicants}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              across all jobs
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Active Jobs
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {analytics.perJobCounts.length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Total Applications
            </h3>
            <p className="text-3xl font-bold text-green-600">
              {analytics.perJobCounts.reduce((sum, job) => sum + job.count, 0)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Offers Made
            </h3>
            <p className="text-3xl font-bold text-purple-600">
              {analytics.statusDistribution.OFFER || 0}
            </p>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Applicants per Job */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Applicants per Job
            </h3>
            <div className="h-64">
              <Bar data={applicantsPerJobData} options={chartOptions} />
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Application Status Distribution
            </h3>
            <div className="h-64">
              <Pie data={statusDistributionData} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  legend: {
                    position: 'bottom' as const,
                    labels: {
                      color: 'rgb(156, 163, 175)',
                    },
                  },
                },
              }} />
            </div>
          </div>

          {/* Average Experience per Job */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm lg:col-span-2">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Average Candidate Experience by Position
            </h3>
            <div className="h-64">
              <Bar data={avgExperienceData} options={{
                ...chartOptions,
                plugins: {
                  ...chartOptions.plugins,
                  tooltip: {
                    callbacks: {
                      label: function(context: any) {
                        const job = analytics.avgExperiencePerJob[context.dataIndex];
                        return [
                          `Average: ${job.avgExperience} years`,
                          `Range: ${job.minExperience} - ${job.maxExperience} years`
                        ];
                      }
                    }
                  }
                },
                scales: {
                  ...chartOptions.scales,
                  y: {
                    ...chartOptions.scales?.y,
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Years of Experience',
                      color: 'rgb(156, 163, 175)',
                    }
                  }
                }
              }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}