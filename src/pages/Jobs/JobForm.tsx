// src/pages/Jobs/JobForm.tsx
import React, { useState, useEffect } from 'react';
import { Job } from '../../types';
import { toast } from 'react-hot-toast';

interface JobFormProps {
  onClose: () => void;
  onCreate: (data: { title: string; slug: string; tags: string[] }) => void;
  onUpdate?: (data: { id: string; title: string; slug: string; tags: string[] }) => void;
  job?: Job;
  existingSlugs?: string[]; // added to check uniqueness
}

export default function JobForm({ onClose, onCreate, onUpdate, job, existingSlugs = [] }: JobFormProps) {
  const [title, setTitle] = useState(job?.title || '');
  const [slug, setSlug] = useState(job?.slug || '');
  const [tags, setTags] = useState(job?.tags.join(', ') || '');

  useEffect(() => {
    if (job) {
      setTitle(job.title);
      setSlug(job.slug);
      setTags(job.tags.join(', '));
    }
  }, [job]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedTitle = title.trim();
    const trimmedSlug = slug.trim();
    const tagsArray = tags.split(',').map(s => s.trim()).filter(Boolean);

    // --- Validation ---
    if (!trimmedTitle) return toast.error('Title is required');
    if (!trimmedSlug) return toast.error('Slug is required');

    const slugTaken = existingSlugs.includes(trimmedSlug) && trimmedSlug !== job?.slug;
    if (slugTaken) return toast.error('Slug must be unique');

    const payload = { title: trimmedTitle, slug: trimmedSlug, tags: tagsArray };
    if (job && onUpdate) {
      onUpdate({ id: job.id, ...payload });
    } else {
      onCreate(payload);
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-lg font-semibold mb-4">{job ? 'Edit Job' : 'Add Job'}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Title"
            className="border p-2 rounded"
          />
          <input
            value={slug}
            onChange={e => setSlug(e.target.value)}
            placeholder="Slug"
            className="border p-2 rounded"
          />
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="Tags (comma separated)"
            className="border p-2 rounded"
          />
          <div className="flex justify-end gap-2 mt-2">
            <button type="button" onClick={onClose} className="px-3 py-1 border rounded">
              Cancel
            </button>
            <button type="submit" className="px-3 py-1 bg-blue-600 text-white rounded">
              {job ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
