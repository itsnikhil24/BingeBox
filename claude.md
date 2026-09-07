# CLAUDE.md — BingeBox Project Overview

## What this project is
BingeBox is a video hosting/streaming platform (YouTube-lite): users sign up, upload a video, the backend transcodes it into adaptive-bitrate HLS (360p/480p/720p/1080p), and other users stream it via a web player.

## Repo layout
```
BingeBox/
├── Backend/     Express + TypeScript API, BullMQ worker, ffmpeg transcoding
├── Frontend/    React 19 + Vite SPA, built and served via nginx in Docker
└── docker-compose.yml   redis + api + worker + frontend services
```

## Architecture

### Two backend processes, one codebase
`Backend/` builds into **two separate runtime processes** from the same source:
- **api** (`index.ts` → `dist/index.js`, `Dockerfile.api`) — Express HTTP server.
- **worker** (`workers/video.worker.ts` → `dist/workers/video.worker.js`, `Dockerfile.worker`) — BullMQ worker that runs ffmpeg.

They **only** communicate through the `video-processing` BullMQ queue (Redis) and the shared Supabase database/storage — never import worker logic into the API process or vice versa, and never call ffmpeg synchronously from a request handler.

### Upload → transcode pipeline
1. `POST /api/video/upload` (multer) saves the raw file to `Backend/uploads/`.
2. Controller inserts a `videos` row (`status: "processing"`) via `supabaseAdmin`, then enqueues a `video-processing` job (`videoQueue.add`) with `{ videoId, inputPath }`.
3. The worker (`workers/video.worker.ts`) picks up the job and calls `processVideoJob` (`services/video-processing.service.ts`), which:
   - runs ffmpeg (`services/ffmpeg.service.ts`) to produce multi-bitrate HLS output under `Backend/output/`,
   - uploads the HLS files to the Supabase `videos` storage bucket (`services/storage.service.ts`),
   - updates the `videos` row to `status: "ready"` with `master_playlist`, and inserts rows into `video_variants`.
4. Local temp files (`uploads/<file>`, `output/<folder>/`) are cleaned up on both success and final failure — never leave orphaned files on disk.
5. On unrecoverable failure the `videos` row is marked `status: "failed"`.

### Data & auth: Supabase is the single source of truth
- **Postgres tables**: `profiles`, `videos`, `video_variants`.
- **Storage bucket** `videos`: HLS segments/playlists, served via public URLs.
- **Auth**: Supabase Auth issues JWTs on signup/login. There is no server-side session store — every protected request carries `Authorization: Bearer <access_token>`, verified per-request in `middleware/auth.middleware.ts` via `supabase.auth.getUser(token)`.
- Two Supabase clients exist in `config/supabase.ts` — keep them separate:
  - `supabase` (anon key) — only used to verify user tokens.
  - `supabaseAdmin` (service role key) — used for all privileged DB/storage writes. **Never expose the service role key to the frontend or use it to trust unverified input.**

## Architectural rules (do not violate)
1. Controllers stay thin — DB/ffmpeg/storage logic belongs in `services/`, not `controllers/`.
2. API and worker are deployed independently (see `Dockerfile.api`, `Dockerfile.worker`, `docker-compose.yml`); a change to one must not silently assume the other is in the same process.
3. Never bypass the queue for video processing — synchronous ffmpeg calls from an HTTP handler will block the event loop and defeats the reason the worker exists.
4. Any code path that writes a file to `uploads/` or `output/` must clean it up in every exit path (success, retryable failure, final failure).
5. Keep response shape consistent across the API: `{ success: boolean, message?: string, ...payload }`.
6. `.env` is never committed (see `Backend/.gitignore`); Docker Compose supplies it via `env_file`.
7. TypeScript backend runs in `strict` mode — don't weaken `tsconfig.json` to silence errors.

## Known inconsistencies (flag before "fixing" silently — confirm with user first)
- `auth.controller.ts` / `auth.routes.ts` have commented-out `me` / `logout` handlers — either finish or remove them, don't leave dead code across commits.

## Coding guidelines
- **Backend**: TypeScript strict, Express 5, layered as `routes/ → middleware/ → controllers/ → services/`. No `any` without a comment justifying it.
- **Frontend**: React 19 functional components + hooks, React Router v7, Tailwind v4, shadcn/ui + radix-ui primitives for UI, `@/` path alias for `Frontend/src`.
- No new abstractions/config beyond what a task needs — this file plus `skills.md` should stay the reference for "how we already do it here."

## Companion files
- `resume.md` — active/completed task tracker (see strict scrubbing rule inside it).
- `skills.md` — living reference of tech stack, library versions, and established patterns in this codebase.
