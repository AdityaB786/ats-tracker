import { Navbar } from '@/components/Navbar';
import { JobList } from '@/components/JobList';

export default function JobsPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
          Job Openings
        </h1>
        
        <JobList showFilters />
      </div>
    </div>
  );
}