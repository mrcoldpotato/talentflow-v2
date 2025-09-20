// src/pages/Jobs/JobsList.tsx
import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Job } from '../../types';
import JobForm from './JobForm';
import JobRow from '../../components/Jobs/JobRow';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { nanoid } from 'nanoid';
import Loading from '../../components/Common/Loading';
import { toast } from 'react-toastify';

export default function JobsList() {
  const [items, setItems] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [openCreate, setOpenCreate] = useState(false);
  const [editJob, setEditJob] = useState<Job | null>(null);
  const pageSize = 10;
  const [error, setError] = useState<string | null>(null);

  // ---------------- Load Jobs ----------------
  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/jobs', { params: { page, pageSize, sort: 'order' } });
      setItems(res.data?.items ?? []);
      setTotal(res.data?.total ?? 0);
    } catch (err) {
      console.error(err);
      setError('Failed to load jobs');
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [page]);

  // ---------------- Create Job ----------------
  async function handleCreate(payload: { title: string; slug: string; tags: string[] }) {
    if (!payload.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (items.some(j => j.slug === payload.slug)) {
      toast.error('Slug must be unique');
      return;
    }

    const tempId = `tmp-${nanoid()}`;
    const temp: Job = {
      id: tempId,
      title: payload.title,
      slug: payload.slug || payload.title,
      tags: payload.tags,
      status: 'active',
      order: items.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setItems(s => [temp, ...s]);
    setOpenCreate(false);

    try {
      const res = await api.post('/jobs', payload);
      setItems(s => s.map(i => i.id === tempId ? res.data : i));
      toast.success('Job created');
    } catch (err) {
      console.error(err);
      setItems(s => s.filter(i => i.id !== tempId));
      toast.error('Failed to create job');
    }
  }

  // ---------------- Update Job ----------------
  async function handleUpdate(payload: { id: string; title: string; slug: string; tags: string[] }) {
    if (!payload.title.trim()) {
      toast.error('Title is required');
      return;
    }
    if (items.some(j => j.slug === payload.slug && j.id !== payload.id)) {
      toast.error('Slug must be unique');
      return;
    }

    try {
      const res = await api.put(`/jobs/${payload.id}`, payload);
      setItems(s => s.map(i => i.id === payload.id ? res.data : i));
      setEditJob(null);
      toast.success('Job updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update job');
    }
  }

  // ---------------- Drag & Drop ----------------
  async function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over) return;

    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);
    if (oldIndex === newIndex) return;

    const optimistic = arrayMove(items, oldIndex, newIndex).map((job, idx) => ({ ...job, order: idx }));
    setItems(optimistic);

    try {
      await api.patch(`/jobs/${active.id}/reorder`, { fromOrder: oldIndex, toOrder: newIndex });
      load();
    } catch (err) {
      console.error(err);
      toast.error('Reorder failed; rolling back');
      load();
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-semibold">Jobs</h2>
        <button
          onClick={() => setOpenCreate(true)}
          className="px-3 py-1 bg-blue-600 text-white rounded"
        >
          Add Job
        </button>
      </div>

      {/* Job Form */}
      {(openCreate || editJob) && (
        <JobForm
          onClose={() => { setOpenCreate(false); setEditJob(null); }}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          job={editJob ?? undefined}
          existingSlugs={items.map(j => j.slug)}
        />
      )}

      {/* Job List */}
      <div className="bg-white rounded shadow p-4 min-h-[200px]">
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : items.length === 0 ? (
          <div>No jobs found</div>
        ) : (
          <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              {items.map(j => (
                <JobRow key={j.id} job={j} onUpdate={load} onEdit={setEditJob} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-4 flex justify-between">
        <div>Showing {items.length} of {total}</div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="px-2 py-1 bg-white border rounded"
          >
            Prev
          </button>
          <button
            onClick={() => setPage(p => p + 1)}
            className="px-2 py-1 bg-white border rounded"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
