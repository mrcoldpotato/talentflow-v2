import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './styles/index.css'
import { seedIfEmpty } from './db/seed'

function startApp() {
  // wrap async logic inside an IIFE
  (async () => {
    // Seed the Dexie DB in both dev and prod
    await seedIfEmpty()

    if (import.meta.env.DEV) {
      // start MSW worker dynamically in dev
      const { worker } = await import('./api/msw/browser')
      worker.start({ onUnhandledRequest: 'bypass' })
    } else {
      // optionally start MSW in prod for preview
      const { worker } = await import('./api/msw/browser')
      worker.start({ onUnhandledRequest: 'bypass' })
    }

    createRoot(document.getElementById('root')!).render(
      <React.StrictMode>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </React.StrictMode>
    )
  })()
}

startApp()
