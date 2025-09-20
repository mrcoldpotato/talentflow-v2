import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/client'
import Loading from '../../components/Common/Loading'
import type { Candidate, TimelineEvent } from '../../types'

export default function CandidateProfile() {
  const { id } = useParams<{ id: string }>()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [timeline, setTimeline] = useState<TimelineEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return

    setLoading(true)
    
    // Fetch candidate by ID
    api.get(`/candidates/${id}`)
      .then(r => setCandidate(r.data))
      .catch(() => setCandidate(null))

    // Fetch candidate timeline
    api.get(`/timeline`, { params: { candidateId: id } })
      .then(r => setTimeline(r.data || []))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <Loading/>
  if (!candidate) return <div>Candidate not found.</div>

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="text-xl font-semibold">{candidate.name}</h2>
      <div className="text-sm text-gray-600">{candidate.email}</div>
      <div className="mt-4">
        <h3 className="font-medium">Timeline</h3>
        <ul className="mt-2">
          {timeline.map(ev => (
            <li key={ev.id} className="text-sm text-gray-700">
              {new Date(ev.ts).toLocaleString()} — {ev.note ?? ev.type}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
