# TalentFlow - Mini Hiring Platform (Front-End Only)

This is a complete scaffold for the TalentFlow assignment: React + Vite + TypeScript, MSW v2 for API mocking, Dexie (IndexedDB) for persistence, Tailwind for styling.

## Quick start

1. Install dependencies:
   ```
   npm install
   ```
2. Run dev server:
   ```
   npm run dev
   ```
3. Open http://localhost:5173

## Notes
- MSW is started automatically in development (see src/main.tsx).
- Database is persisted in IndexedDB via Dexie. To reseed, delete the `talentflow_db` IndexedDB in your browser devtools and refresh.
