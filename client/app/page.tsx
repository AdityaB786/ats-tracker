'use client';

import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { JobList } from '@/components/JobList';
import { useAuth } from '@/lib/auth-context';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Where Talent Meets Opportunity
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Connect with top employers and take the next step in your career
          </p>
          <div className="flex justify-center gap-4">
            {user ? (
              user.role === 'applicant' ? (
                <>
                  <Link
                    href="/jobs"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Browse Jobs
                  </Link>
                  <Link
                    href="/dashboard"
                    className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    My Applications
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/recruiter/jobs"
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
                  >
                    Manage Jobs
                  </Link>
                  <Link
                    href="/recruiter/analytics"
                    className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                  >
                    View Analytics
                  </Link>
                </>
              )
            ) : (
              <>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
                >
                  Get Started
                </Link>
                <Link
                  href="/jobs"
                  className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Browse Jobs
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Latest Job Openings
          </h2>
          <JobList limit={6} />
        </div>
      </div>
    </div>
  );
}