# UI refresh notes

This refresh keeps the existing React/Tailwind components and API logic in place while applying a cohesive visual system: indigo actions, a deep navy navigation rail, softer card surfaces, improved form focus states, responsive spacing, and reduced-motion support.

## Environment setup

The uploaded `.env` files were removed from this copy for safety. Copy `frontend/.env.example` to `frontend/.env` and `backend/.env.example` to `backend/.env`, then fill in your own values. Never commit real credentials or JWT secrets. If the original environment values were real and were shared publicly, rotate them.

## Run locally

- Frontend: `cd frontend && npm install && npm run dev`
- Backend: `cd backend && npm install && npm run dev` (or the start script defined in `backend/package.json`)
