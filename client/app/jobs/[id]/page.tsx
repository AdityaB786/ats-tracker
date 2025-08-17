'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Job } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/Navbar';
import { ApplicationForm } from '@/components/ApplicationForm';
import toast from 'react-hot-toast';

export default function JobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    fetchJob();
    if (user?.role === 'applicant') {
      checkIfApplied();
    }
  }, [params.id, user]);

  const fetchJob = async () => {
    try {
      const response = await api.getJob(params.id as string);
      setJob(response.job);
    } catch (error) {
      toast.error('Failed to load job details');
      router.push('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    try {
      const response = await api.getMyApplications();
      const applied = response.items.some(
        (app: any) => (app.jobId._id || app.jobId) === params.id
      );
      setHasApplied(applied);
    } catch (error) {
      console.error('Failed to check application status');
    }
  };

  const handleApply = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setShowApplicationForm(true);
  };

  const handleApplicationSuccess = () => {
    setShowApplicationForm(false);
    setHasApplied(true);
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return null;
  }

  const isExpired = new Date(job.deadline) < new Date();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            {job.title}
          </h1>
          
          <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-600 dark:text-gray-400">
            <span>{job.location || 'Remote'}</span>
            <span>•</span>
            <span>Posted {new Date(job.createdAt).toLocaleDateString()}</span>
            <span>•</span>
            <span>Deadline: {new Date(job.deadline).toLocaleDateString()}</span>
          </div>

          {isExpired && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-6">
              This job posting has expired
            </div>
          )}

          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Job Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {job.description}
            </p>
          </div>

          {job.requirements && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Requirements
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {job.requirements}
              </p>
            </div>
          )}

          {user?.role === 'applicant' && (
            <div className="mt-8">
              {hasApplied ? (
                <button
                  disabled
                  className="bg-gray-400 text-white px-6 py-3 rounded-lg font-medium cursor-not-allowed"
                >
                  Already Applied
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={isExpired}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply Now
                </button>
              )}
            </div>
          )}

          {!user && (
            <div className="mt-8">
              <button
                onClick={() => router.push('/login')}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Login to Apply
              </button>
            </div>
          )}
        </div>
      </div>

      {showApplicationForm && (
        <ApplicationForm
          jobId={params.id as string}
          onSuccess={handleApplicationSuccess}
          onCancel={() => setShowApplicationForm(false)}
        />
      )}
    </div>
  );
}