'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { Navbar } from '@/components/Navbar';

export default function DebugPage() {
  const { user } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDebugInfo();
    }
  }, [user]);

  const fetchDebugInfo = async () => {
    try {
      // Get current user info
      const meResponse = await api.getMe();
      
      // Get all jobs (debug endpoint)
      const debugResponse = await fetch('http://localhost:5000/api/jobs/debug');
      const allJobs = await debugResponse.json();
      
      // Get my jobs
      const myJobsResponse = await api.getMyJobs();
      
      setDebugInfo({
        currentUser: meResponse.user,
        allJobs: allJobs,
        myJobs: myJobsResponse,
        comparison: {
          currentUserId: meResponse.user._id,
          jobsWithMatchingId: allJobs.jobs?.filter((job: any) => 
            job.recruiterId === meResponse.user._id
          ),
          jobsCount: allJobs.totalJobs
        }
      });
    } catch (error) {
      console.error('Debug error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading debug info...</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-2xl font-bold mb-6">Debug Information</h1>
        
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-4 rounded">
            <h2 className="font-bold mb-2">Current User</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo.currentUser, null, 2)}
            </pre>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded">
            <h2 className="font-bold mb-2">All Jobs in Database</h2>
            <p>Total: {debugInfo.allJobs?.totalJobs || 0}</p>
            <pre className="text-sm overflow-auto max-h-96">
              {JSON.stringify(debugInfo.allJobs?.jobs, null, 2)}
            </pre>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded">
            <h2 className="font-bold mb-2">My Jobs Response</h2>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo.myJobs, null, 2)}
            </pre>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded">
            <h2 className="font-bold mb-2">ID Comparison</h2>
            <p>Current User ID: <code>{debugInfo.comparison?.currentUserId}</code></p>
            <p>Jobs matching this ID: {debugInfo.comparison?.jobsWithMatchingId?.length || 0}</p>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(debugInfo.comparison?.jobsWithMatchingId, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}