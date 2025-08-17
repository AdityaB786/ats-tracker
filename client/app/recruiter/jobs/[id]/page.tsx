'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Job, Application, ApplicationStatus } from '@/types';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Navbar } from '@/components/Navbar';
import toast from 'react-hot-toast';

const statusColumns: ApplicationStatus[] = ['APPLIED', 'UNDER_REVIEW', 'INTERVIEW', 'OFFER', 'REJECTED'];

const statusColors = {
  APPLIED: 'bg-blue-50 border-blue-200',
  UNDER_REVIEW: 'bg-yellow-50 border-yellow-200',
  INTERVIEW: 'bg-purple-50 border-purple-200',
  OFFER: 'bg-green-50 border-green-200',
  REJECTED: 'bg-red-50 border-red-200',
};

export default function RecruiterJobDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [applicationsByStatus, setApplicationsByStatus] = useState<Record<ApplicationStatus, Application[]>>({
    APPLIED: [],
    UNDER_REVIEW: [],
    INTERVIEW: [],
    OFFER: [],
    REJECTED: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    } else if (user?.role === 'applicant') {
      router.push('/dashboard');
    } else if (user) {
      fetchJobAndApplications();
    }
  }, [user, authLoading, params.id]);

  const fetchJobAndApplications = async () => {
    try {
      const [jobResponse, applicationsResponse] = await Promise.all([
        api.getJob(params.id as string),
        api.getJobApplications(params.id as string),
      ]);

      setJob(jobResponse.job);
      setApplicationsByStatus(applicationsResponse.byStatus);
    } catch (error) {
      toast.error('Failed to load job details');
      router.push('/recruiter/jobs');
    } finally {
      setLoading(false);
    }
  };


  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.droppableId === result.destination.droppableId) return;

    const applicationId = result.draggableId;
    const newStatus = result.destination.droppableId as ApplicationStatus;
    const oldStatus = result.source.droppableId as ApplicationStatus;

    // Optimistic update
    const movedApplication = applicationsByStatus[oldStatus][result.source.index];
    const newApplicationsByStatus = { ...applicationsByStatus };
    
    // Remove from old status
    newApplicationsByStatus[oldStatus] = [...applicationsByStatus[oldStatus]];
    newApplicationsByStatus[oldStatus].splice(result.source.index, 1);
    
    // Add to new status
    newApplicationsByStatus[newStatus] = [...applicationsByStatus[newStatus]];
    newApplicationsByStatus[newStatus].splice(result.destination.index, 0, {
      ...movedApplication,
      status: newStatus,
    });
    
    setApplicationsByStatus(newApplicationsByStatus);

    try {
      await api.updateApplication(applicationId, { status: newStatus });
      toast.success('Application status updated');
    } catch (error) {
      // Revert on error
      setApplicationsByStatus(applicationsByStatus);
      toast.error('Failed to update status');
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

  if (!job) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {job.title}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {job.location || 'Remote'} • Deadline: {new Date(job.deadline).toLocaleDateString()}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Application Pipeline
          </h2>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {statusColumns.map((status) => (
                <div key={status} className="bg-white dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                    {status.replace('_', ' ')} ({applicationsByStatus[status].length})
                  </h3>
                  
                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`min-h-[200px] ${
                          snapshot.isDraggingOver ? 'bg-gray-100 dark:bg-gray-700' : ''
                        }`}
                      >
                        {applicationsByStatus[status].map((application, index) => {
                          return (
                            <Draggable
                              key={application._id}
                              draggableId={application._id}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`p-3 mb-2 rounded border ${
                                    statusColors[status]
                                  } ${
                                    snapshot.isDragging ? 'shadow-lg' : ''
                                  } cursor-move`}
                                >
                                  <p className="font-medium text-gray-900">
                                    {application.applicantName}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {application.applicantEmail}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {application.applicantPhone}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {application.yearsOfExperience} years exp.
                                    {application.currentRole && ` • ${application.currentRole}`}
                                  </p>
                                  {application.resumeFileName && (
                                    <a
                                      href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/applications/${application._id}/resume`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-xs text-blue-600 hover:underline mt-1 inline-block"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const token = localStorage.getItem('token');
                                        window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/applications/${application._id}/resume?token=${token}`, '_blank');
                                        e.preventDefault();
                                      }}
                                    >
                                      📄 View Resume
                                    </a>
                                  )}
                                  {application.notes && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Notes: {application.notes}
                                    </p>
                                  )}
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              ))}
            </div>
          </DragDropContext>
        </div>
      </div>
    </div>
  );
}