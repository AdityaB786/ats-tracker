'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { ThemeToggle } from './ThemeToggle';
import { useState } from 'react';

export function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link
              href="/"
              className="flex items-center text-xl font-bold text-gray-900 dark:text-white"
            >
              Internify
            </Link>
            
            {user && (
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {user.role === 'applicant' ? (
                  <>
                    <Link
                      href="/jobs"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Browse Jobs
                    </Link>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      My Applications
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/recruiter/jobs"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      My Jobs
                    </Link>
                    <Link
                      href="/recruiter/analytics"
                      className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 dark:text-gray-200 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Analytics
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {user.role}
                  </p>
                </div>
                <button
                  onClick={() => logout()}
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-md transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d={mobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden">
            <div className="pt-2 pb-3 space-y-1">
              {user ? (
                user.role === 'applicant' ? (
                  <>
                    <Link
                      href="/jobs"
                      className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Browse Jobs
                    </Link>
                    <Link
                      href="/dashboard"
                      className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      My Applications
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/recruiter/jobs"
                      className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      My Jobs
                    </Link>
                    <Link
                      href="/recruiter/analytics"
                      className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      Analytics
                    </Link>
                  </>
                )
              ) : null}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}