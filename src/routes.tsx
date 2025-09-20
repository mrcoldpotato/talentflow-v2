// src/routes.tsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'
import JobsList from './pages/Jobs/JobsList'
import JobDetails from './pages/Jobs/JobDetails'
import CandidatesList from './pages/Candidates/CandidatesList'
import CandidateProfile from './pages/Candidates/CandidateProfile'
import CandidateForm from './pages/Candidates/CandidateForm'
import AssessmentsIndex from './pages/Assessments/Index'
import Builder from './pages/Assessments/Builder'
import Runner from './pages/Assessments/Runner'
import WelcomePage from './pages/WelcomePage' // NEW

export default function AppRoutes() {
  return (
    <Routes>
      {/* Welcome page at root */}
      <Route path="/" element={<WelcomePage />} />

      {/* Jobs */}
      <Route path="/jobs" element={<JobsList />} />
      <Route path="/jobs/:jobId" element={<JobDetails />} />

      {/* Candidates */}
      <Route path="/candidates" element={<CandidatesList />} />
      <Route path="/candidates/new" element={<CandidateForm />} />
      <Route path="/candidates/:id" element={<CandidateProfile />} />

      {/* Assessments */}
      <Route path="/assessments" element={<AssessmentsIndex />} />
      <Route path="/assessments/:jobId/builder" element={<Builder />} />
      <Route path="/assessments/:jobId/run" element={<Runner />} />
    </Routes>
  )
}
