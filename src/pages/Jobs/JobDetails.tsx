import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../../api/client';
import Loading from '../../components/Common/Loading';
import { Job } from '../../types';
import { toast } from 'react-hot-toast';

export default function JobDetails() {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    setLoading(true);

    api.get(`/jobs/${jobId}`)
      .then(res => setJob(res.data))
      .catch(err => {
        console.error(err);
        toast.error('Job not found');
        setJob(null);
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  if (loading) return <Loading />;
  if (!job) return <div className="text-red-500">Job not found</div>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold">{job.title}</h2>
      <div className="text-sm text-gray-600 mt-2">
        Tags: {job.tags?.length ? job.tags.join(', ') : 'None'}
      </div>
      <div className="mt-4">Status: {job.status}</div>
    </div>
  );
}
