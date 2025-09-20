// src/pages/Candidates/CandidateForm.tsx
import React, { useState } from 'react'
import api from '../../api/client'
import { useNavigate } from 'react-router-dom'

export default function CandidateForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newCandidate = await api.post('/candidates', { name, email })
    navigate(`/candidates/${newCandidate.data.id}`)
  }

  return (
    <div className="max-w-md mx-auto p-4 bg-white rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Add Candidate</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          className="border p-2 rounded"
          placeholder="Name"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          className="border p-2 rounded"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white p-2 rounded">Create</button>
      </form>
    </div>
  )
}
