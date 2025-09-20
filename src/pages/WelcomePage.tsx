// src/pages/WelcomePage.tsx
import React from 'react';
import { Link } from 'react-router-dom';

export default function WelcomePage() {
  // Dummy data
  const openJobs = [
    { id: 1, title: 'Frontend Developer', applicants: 12 },
    { id: 2, title: 'Backend Developer', applicants: 8 },
    { id: 3, title: 'UI/UX Designer', applicants: 5 },
  ];

  const newCandidates = [
    { id: 1, name: 'Alice Johnson', appliedFor: 'Frontend Developer' },
    { id: 2, name: 'Bob Smith', appliedFor: 'Backend Developer' },
    { id: 3, name: 'Charlie Lee', appliedFor: 'UI/UX Designer' },
  ];

  const upcomingAssessments = [
    { id: 1, job: 'Frontend Developer', date: '2025-09-25' },
    { id: 2, job: 'Backend Developer', date: '2025-09-27' },
    { id: 3, job: 'UI/UX Designer', date: '2025-09-30' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero section content only */}
      <div className="relative min-h-[400px] flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-5xl font-bold mb-4 text-white">Welcome to TalentFlow</h1>
        <p className="text-xl mb-6 text-white">Your hiring process, simplified and organized.</p>
        <Link
          to="/jobs"
          className="inline-block bg-white text-primary font-semibold px-6 py-3 rounded shadow hover:bg-gray-100 transition"
        >
          Go to Jobs
        </Link>
      </div>

      {/* Dashboard sections */}
      <div className="max-w-6xl mx-auto py-16 px-4 space-y-12">
        {/* Open Jobs */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-white">Open Jobs</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {openJobs.map((job) => (
              <div
                key={job.id}
                className="bg-white p-6 rounded shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold">{job.title}</h3>
                <p className="text-gray-600 mt-2">{job.applicants} applicants</p>
              </div>
            ))}
          </div>
        </section>

        {/* New Candidates */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-white">New Candidates</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {newCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className="bg-white p-6 rounded shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold">{candidate.name}</h3>
                <p className="text-gray-600 mt-2">Applied for: {candidate.appliedFor}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Upcoming Assessments */}
        <section>
          <h2 className="text-2xl font-bold mb-4 text-white">Upcoming Assessments</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {upcomingAssessments.map((assessment) => (
              <div
                key={assessment.id}
                className="bg-white p-6 rounded shadow hover:shadow-lg transition"
              >
                <h3 className="text-xl font-semibold">{assessment.job}</h3>
                <p className="text-gray-600 mt-2">Date: {assessment.date}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
