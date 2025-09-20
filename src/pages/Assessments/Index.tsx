import React, { useEffect, useState } from 'react'
import api from '../../api/client'
import { Link } from 'react-router-dom'

export default function AssessmentsIndex(){
  const [jobs, setJobs] = useState<any[]>([])
  useEffect(()=>{ api.get('/jobs',{params:{page:1,pageSize:1000}}).then(r=>setJobs(r.data.items)) },[])
  return (
    <div>
      <h2 className="text-white font-semibold mb-4">Assessments</h2>
      <div className="grid grid-cols-3 gap-3">
        {jobs.map(j=>(
          <div key={j.id} className="bg-white p-3 rounded shadow">
            <div className="font-medium">{j.title}</div>
            <div className="text-sm text-gray-500">Tags: {j.tags.join(', ')}</div>
            <div className="mt-2 flex gap-2">
              <Link to={`/assessments/${j.id}/builder`} className="text-blue-600">Builder</Link>
              <Link to={`/assessments/${j.id}/run`} className="text-blue-600">Run</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
