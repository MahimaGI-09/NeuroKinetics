# NeuroKinetics

## Deploy to Vercel

The root `vercel.json` configures this repository as one Vercel project with two
services: the Vite frontend (`app`) and the FastAPI backend (`backend`). Requests
to `/api/*` are routed to FastAPI; all other paths are served by the frontend.
The frontend uses the relative `/api` path in production, so no
`VITE_API_BASE_URL` setting is needed on Vercel. Local development continues to
use `http://localhost:8000` by default.

Before deploying a production instance, configure a strong `SECRET_KEY` and a
persistent external database. The current backend defaults to SQLite on disk,
which is suitable for local development but is not persistent on Vercel.