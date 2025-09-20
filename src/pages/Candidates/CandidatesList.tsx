// src/pages/Candidates/CandidatesList.tsx
import React, { useEffect, useState } from 'react'
import api from '../../api/client'
import { Candidate, CandidateStage } from '../../types'
import { Link } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'

const stages: CandidateStage[] = ['applied','screen','tech','offer','hired','rejected']

export default function CandidatesList() {
  const [items, setItems] = useState<Candidate[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')

  async function load() {
    setLoading(true)
    try {
      const r = await api.get('/candidates', { params: { page: 1, pageSize: 1000, search } })
      setItems(r.data ?? [])
    } catch (err) {
      console.error(err)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search])

  // Group candidates by stage
  const stageMap: Record<CandidateStage, Candidate[]> = {
    applied: [], screen: [], tech: [], offer: [], hired: [], rejected: []
  }
  items.forEach(c => stageMap[c.stage].push(c))

  function onDragEnd(result: DropResult) {
    const { source, destination } = result
    if (!destination) return

    const sourceStage = source.droppableId as CandidateStage
    const destStage = destination.droppableId as CandidateStage

    if (sourceStage === destStage) {
      const newList = Array.from(stageMap[sourceStage])
      const [moved] = newList.splice(source.index, 1)
      newList.splice(destination.index, 0, moved)
      stageMap[sourceStage] = newList
    } else {
      const sourceList = Array.from(stageMap[sourceStage])
      const destList = Array.from(stageMap[destStage])
      const [moved] = sourceList.splice(source.index, 1)
      moved.stage = destStage
      destList.splice(destination.index, 0, moved)
      stageMap[sourceStage] = sourceList
      stageMap[destStage] = destList

      api.patch(`/candidates/${moved.id}/stage`, { stage: destStage }).catch(console.error)
    }

    setItems([...items])
  }

  async function handleCreateCandidate(e: React.FormEvent) {
    e.preventDefault()
    try {
      const r = await api.post('/candidates', {
        name: newName.trim(),
        email: newEmail.trim(),
        stage: 'applied', // explicitly set default stage
      })
      setItems(prev => [...prev, r.data])
      setShowModal(false)
      setNewName('')
      setNewEmail('')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name or email"
          className="border p-2 rounded w-80"
        />
        <button
          onClick={() => setShowModal(true)}
          className="text-white font-medium"
        >
          + Add Candidate
        </button>
      </div>

      {loading ? <div>Loading...</div> :
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex gap-4 py-2">
            {stages.map(stage => (
              <Droppable droppableId={stage} key={stage}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-1 min-w-0 bg-gray-100 rounded p-2 flex flex-col"
                  >
                    <h3 className="font-semibold text-center mb-2">{stage.toUpperCase()}</h3>
                    <div className="flex flex-col gap-2">
                      {stageMap[stage].length === 0 ? (
                        <div className="text-gray-400 text-sm text-center">No candidates</div>
                      ) : (
                        stageMap[stage].map((c, index) => (
                          <Draggable key={c.id} draggableId={c.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="p-3 bg-white rounded shadow-sm border"
                              >
                                <Link to={`/candidates/${c.id}`} className="font-medium block">{c.name}</Link>
                                <div className="text-xs text-gray-500">{c.email}</div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      }

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Candidate</h2>
            <form onSubmit={handleCreateCandidate} className="flex flex-col gap-3">
              <input
                className="border p-2 rounded"
                placeholder="Name"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                required
              />
              <input
                className="border p-2 rounded"
                placeholder="Email"
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                required
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
