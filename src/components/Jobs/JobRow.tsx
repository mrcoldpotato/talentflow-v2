// src/components/Jobs/JobRow.tsx
import React from 'react';
import { Job } from '../../types';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Menu } from 'lucide-react'; // drag handle icon

interface JobRowProps {
  job: Job;
  onUpdate: () => void;
  onEdit: (job: Job) => void;
}

export default function JobRow({ job, onUpdate, onEdit }: JobRowProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: job.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'grab',
  };

  async function toggleArchive() {
    try {
      await api.put(`/jobs/${job.id}`, {
        status: job.status === 'active' ? 'archived' : 'active',
      });
      onUpdate();
    } catch (err) {
      console.error(err);
      alert('Failed to update job');
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="p-3 border-b flex items-center justify-between bg-white rounded mb-1"
    >
      <div className="flex items-center gap-3">
        {/* Drag handle */}
        <div {...listeners} className="cursor-grab">
          <Menu size={20} className="text-gray-400" />
        </div>
        <div>
          <Link to={`/jobs/${job.id}`} className="font-medium">
            {job.title}
          </Link>
          <div className="text-xs text-gray-500">Tags: {job.tags.join(', ')}</div>
        </div>
      </div>
      <div className="flex gap-2 items-center">
        <div className="text-sm text-gray-600">{job.status}</div>
        <button onClick={() => onEdit(job)} className="text-sm text-blue-600">
          Edit
        </button>
        <button onClick={toggleArchive} className="text-sm text-blue-600">
          {job.status === 'active' ? 'Archive' : 'Unarchive'}
        </button>
      </div>
    </div>
  );
}
