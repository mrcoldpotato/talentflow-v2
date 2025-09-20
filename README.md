# TalentFlow v2

**TalentFlow** is a mini hiring platform built for HR teams to manage jobs, candidates, and assessments. This project is a front-end React application with mock backend data stored in IndexedDB (using Dexie) and MSW (Mock Service Worker) for API simulation.

---

## Table of Contents

* [Demo](#demo)
* [Features](#features)
* [Setup](#setup)
* [Architecture](#architecture)
* [Technical Decisions](#technical-decisions)
* [Known Issues](#known-issues)
* [License](#license)

---

## Demo

* **Deployed App:** \[Insert Netlify Link Here]
* **GitHub Repository:** \[Insert GitHub Repo Link Here]

---

## Features

* **Jobs Management:** Create, edit, archive, reorder jobs via drag-and-drop (with optimistic updates).
* **Candidates Management:** Track candidates applying for jobs, manage their stages, view profiles.
* **Assessments:** Job-specific assessments with multiple sections and question types.
* **Dashboard:** Welcome page showing open jobs, new candidates, and upcoming assessments.
* **Notifications:** Toast notifications for user actions.
* **Responsive UI:** Built with Tailwind CSS.
* **Mock Backend:** MSW simulates API calls; IndexedDB (Dexie) stores job, candidate, and assessment data.

---

## Setup

1. **Clone the repository**

```bash
git clone https://github.com/YourUsername/TalentFlow-v2.git
cd TalentFlow-v2
```

2. **Install dependencies**

```bash
npm install
```

3. **Run in development**

```bash
npm run dev
```

* This starts a Vite dev server. MSW will intercept API calls, and IndexedDB will be seeded automatically.

4. **Build for production**

```bash
npm run build
```

* Output will be in the `dist/` folder.

5. **Preview production build**

```bash
npm run preview
```

---

## Architecture

```
TalentFlow-v2
│
├─ public/                 # Static assets
│   └─ images/welcome-bg.jpg
│
├─ src/
│   ├─ api/                # MSW handlers & API client
│   ├─ components/         # Reusable UI components & Job/Candidate rows
│   ├─ db/                 # Dexie database and seed scripts
│   ├─ pages/              # All app pages (Jobs, Candidates, Assessments, Welcome)
│   ├─ styles/             # Tailwind and global CSS
│   ├─ types/              # TypeScript interfaces
│   ├─ utils/              # Utility functions
│   ├─ App.tsx             # Main layout with header, routes, toast, and footer
│   └─ main.tsx            # Entry point, IndexedDB seeding, MSW initialization
│
├─ tailwind.config.cjs      # Tailwind configuration
├─ postcss.config.cjs       # PostCSS config
├─ vite.config.ts           # Vite configuration
└─ package.json             # Dependencies and scripts
```

**Data Flow:**

* Pages call `api/client.ts` which either hits MSW handlers or directly reads from IndexedDB.
* IndexedDB (via Dexie) stores jobs, candidates, and assessments.
* MSW intercepts API calls in development for testing without a real backend.
* Components are modular and reusable (JobRow, CandidateRow, Buttons, Modals, etc.).
* Drag-and-drop reordering is implemented with optimistic UI updates and rollback on failure.

---

## Technical Decisions

1. **React + TypeScript** for type safety and modern front-end architecture.
2. **Vite** as the build tool for fast development and production builds.
3. **Tailwind CSS** for utility-first, responsive design.
4. **IndexedDB (Dexie)** for local persistent storage; allows offline data simulation.
5. **MSW (Mock Service Worker)** for mocking API endpoints during development.
6. **React-Toastify** for non-blocking toast notifications.
7. **Drag-and-drop** implemented for job reordering with optimistic updates.
8. **Fixed background image & global footer** for consistent UI across all pages.

---

## Known Issues

* **IndexedDB seeding in production:** Ensure seeding runs on app initialization; top-level `await` issues were resolved by wrapping seeding in an async function.
* **MSW in production:** Mock service worker runs in production preview only if explicitly imported; optional for live deployment.
* **Reordering rollback:** Currently, reordering only rolls back if API call fails in dev mode; no backend in production, so it persists in IndexedDB only.

---

## License

This project is licensed under the MIT License.
