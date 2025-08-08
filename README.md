Zylo Lesson Planner is a playful, mobile-first Next.js app for planning music lessons across a term.

## Features
- 5-step lesson planning flow (details → song → activities → review → downloads)
- Tailwind CSS with Zylo brand colors (Pink, Green, Blue, Yellow, Gray)
- n8n webhook integration with retry and graceful fallbacks
- Responsive, touch-friendly UI with animations
- Dockerfile and docker-compose for deployment; Dokploy config

## Getting Started
1. Install deps: `npm install`
2. Dev server: `npm run dev`
3. Build: `npm run build` and run: `npm start`

Optional env (see `dokploy.json` for defaults):
- `NEXT_PUBLIC_API_BASE_URL` — base URL for n8n webhooks
- `NEXT_PUBLIC_APP_URL` — public app URL

## API Endpoints (n8n)
Configured in `lib/api.ts`:
- STEP1_SUBMIT — submit lesson details
- STEP2_LOAD_SONGS — load song options
- STEP2_SELECT_SONG — select song
- STEP3_LOAD_ACTIVITIES — load activities
- STEP3_SELECT_ACTIVITIES — select warmup/game
- STEP4_LOAD_PLANS — load generated lesson plans
- STEP4_REFINE — refine plans by change request
- STEP4_APPROVE — approve plans
- STEP5_GET_DOWNLOADS — get download links

All endpoints include retries and demo fallbacks.

## Deployment (Docker / Dokploy)
Use the provided `Dockerfile` and `docker-compose.yml`. For Dokploy, see `dokploy.json` and set your repo/branch/domain. Ensure environment variables are set for production.

## Health Check
`/api/health` returns `{ ok: true }`.
