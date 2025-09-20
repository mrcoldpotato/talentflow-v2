// src/main.tsx
import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'
import { worker } from './api/msw/browser'
import { seedIfEmpty } from './db/seed'

async function init() {
  // Start MSW in dev AND prod
  await worker.start({ onUnhandledRequest: 'bypass' })

  // Seed Dexie if empty
  await seedIfEmpty()

  // Render the app
  createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  )
}

init()
