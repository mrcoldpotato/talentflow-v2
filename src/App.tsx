// src/App.tsx
import React from 'react';
import AppRoutes from './routes';
import { Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
  return (
    <div
      className="min-h-screen flex flex-col bg-cover bg-center bg-fixed"
      style={{ backgroundImage: "url('/images/welcome-bg.jpg')" }}
    >
      {/* HEADER */}
      <header className="bg-white shadow z-20">
        <div className="w-full px-5 py-3 flex items-center justify-between">
          <Link to="/">
            <h1 className="text-xl font-bold cursor-pointer hover:text-primary transition">
              TalentFlow
            </h1>
          </Link>

          <nav className="flex gap-4">
            <Link to="/jobs" className="text-sm text-slate-700">Jobs</Link>
            <Link to="/candidates" className="text-sm text-slate-700">Candidates</Link>
            <Link to="/assessments" className="text-sm text-slate-700">Assessments</Link>
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="w-full px-5 py-4 flex-1">
        <div className="overflow-x-auto">
          <AppRoutes />
        </div>
      </main>

      {/* Toast notifications */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      {/* FOOTER */}
      <footer className="bg-gray-800 text-white py-4 mt-auto">
        <div className="container mx-auto px-5 text-center">
          <p>© 2025 Khroti Therie | BTech CSE | NIT Nagaland</p>
          <p>Built using React, Tailwind CSS, and MSW</p>
        </div>
      </footer>
    </div>
  );
}
