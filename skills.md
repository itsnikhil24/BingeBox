# skills.md — Tech Stack & Patterns Reference

Living document. Agent 4 updates this whenever a task introduces a new library, pattern, or convention. Keep entries factual and current — delete/update anything that becomes stale rather than appending contradictions.

## Backend (`Backend/`)

**Runtime & language**
- Node.js, TypeScript 5.9, `tsconfig.json`: `strict: true`, `module: CommonJS`, `target: ES2020`, `outDir: ./dist`.
- Dev: `ts-node-dev --respawn --transpile-only`. Prod: compiled via `tsc` then run with plain `node`.

**Key libraries**
| Library | Version | Used for |
|---|---|---|
| express | ^5.2.1 | HTTP API |
| @supabase/supabase-js | ^2.110.8 | Auth, Postgres, Storage |
| bullmq | ^6.2.0 | Job queue (video transcoding) |
| ioredis | ^6.0.0 | Redis client (BullMQ connection) |
| multer | ^2.1.1 | Multipart file upload handling |
| cors | ^2.8.6 | CORS middleware |
| dotenv | ^17.4.2 | Env var loading |

**Patterns in use**
- **Layering**: `routes/*.route(s).ts` → `middleware/*.middleware.ts` → `controllers/*.controller.ts` → `services/*.service.ts`. Controllers call services; services own external I/O (ffmpeg, Supabase, filesystem).
- **Dual Supabase client**: `config/supabase.ts` exports `supabase` (anon key, for verifying user JWTs only) and `supabaseAdmin` (service role key, for all privileged reads/writes). Pick the client based on trust level, not convenience.
- **Auth middleware**: `middleware/auth.middleware.ts` reads `Authorization: Bearer <token>`, calls `supabase.auth.getUser(token)`, attaches result to `req.user` (typed via `types/express.d.ts` global augmentation of `Express.Request`).
- **Queue/worker split**: `queues/video.queue.ts` defines the `Queue<VideoProcessingJob>` and its retry policy (3 attempts, exponential backoff starting at 5s). `workers/video.worker.ts` defines the `Worker` with `concurrency: 1`, handles SIGTERM/SIGINT for graceful shutdown, and deletes the source upload only on the final failed attempt.
- **ffmpeg HLS transcode**: `services/ffmpeg.service.ts` spawns a single `ffmpeg` process with `-filter_complex split` into 4 scaled outputs (360p/480p/720p/1080p), `-var_stream_map` to produce one HLS variant playlist per rendition plus a `master.m3u8`, then renames numeric playlist names (`0.m3u8`...) to resolution names and patches references inside `master.m3u8` accordingly.
- **Storage upload**: `services/storage.service.ts` walks a local folder and uploads every file to the Supabase `videos` bucket at `<folderName>/<file>`, setting content-type by extension (`.m3u8` → `application/vnd.apple.mpegurl`, `.ts` → `video/mp2t`); returns the bucket's public URL for `master.m3u8`.
- **Response shape convention**: every controller returns `{ success: boolean, message?: string, ...data }` with an appropriate HTTP status code; errors are caught per-handler and logged with a tagged `console.error` (`"UPLOAD ERROR:"`, `"DATABASE ERROR:"`, etc.) before returning a 4xx/5xx JSON body.
- **Temp file cleanup**: any handler/service that writes to `uploads/` or `output/` removes it in a `finally` or on every error branch — no path should leave orphaned files.

**Docker**
- `Dockerfile.api` and `Dockerfile.worker` are both multi-stage (`builder` stage runs `npm ci && npm run build`; runtime stage does `npm ci --omit=dev` and copies `dist/`).
- `Dockerfile.worker` additionally installs `ffmpeg` via `apt-get` in the runtime stage — the API image does not need ffmpeg.
- `docker-compose.yml` wires `redis` (redis:7-alpine), `api`, and `worker`, all sharing `Backend/.env` via `env_file` and depending on `redis`.
- **Port**: `index.ts` reads `process.env.PORT`, defaulting to `3000` if unset — matches `Dockerfile.api`'s `EXPOSE 3000` and `docker-compose.yml`'s `3000:3000` mapping. Set `PORT` in `Backend/.env` to override.

## Frontend (`Frontend/`)

**Runtime & language**
- React 19, Vite 8 (`@vitejs/plugin-react`), JavaScript (JSX, not TypeScript) with a `jsconfig.json` path alias `@` → `src`.

**Key libraries**
| Library | Version | Used for |
|---|---|---|
| react-router-dom | ^7.18.2 | Client-side routing |
| axios | ^1.19.0 | HTTP calls (video service) — note: `services/auth.js` uses raw `fetch` instead, inconsistent with `services/videoService.js` |
| @tanstack/react-query | ^5.95.2 | (present in deps; check current usage before assuming it's wired into data fetching) |
| tailwindcss | ^4.2.2 (via `@tailwindcss/vite`) | Styling |
| shadcn / radix-ui / @base-ui/react | latest per package.json | UI primitives (`components/ui/*`) |
| hls.js | ^1.6.15 | HLS playback in `VideoPlayer` |
| video.js | ^8.23.7 | Video player (check which of hls.js/video.js is the active player path before adding features) |
| lucide-react / react-icons | — | Icons |

**Patterns in use**
- **Routing**: single `App.jsx` with `BrowserRouter` → `/` (LandingPage), `/dashboard` (Dashboard), `/watch/:id` (Watch).
- **API base URL**: both `services/auth.js` and `services/videoService.js` read `import.meta.env.VITE_API_BASE_URL` (falling back to `http://localhost:3000` if unset) and build their endpoint paths from it — set via `Frontend/.env` (gitignored; `Frontend/.env.example` is the committed template). Any new frontend service should follow this pattern, not a fresh hardcoded `localhost` string.
- **Auth on the client**: no real auth SDK usage — `services/auth.js` calls the backend REST endpoints directly (`${BASE_URL}/api/auth`); session/user are persisted to `localStorage` (`"session"`, `"user"` keys) and read back via `utils/auth.js#getCurrentUser()`.
- **Video API calls**: `services/videoService.js` uses axios against `${BASE_URL}/api/video`; authenticated calls (`uploadVideo`) pull the access token out of the `localStorage` `"session"` blob and set `Authorization: Bearer <token>` manually per-call (no shared axios instance/interceptor yet).
- **Component structure**: `components/` holds shared UI (Navbar, AuthDialog, UploadModal, VideoCard, VideoPlayer, AnimatedBackground) each paired with a co-located `.css` file; `components/ui/` holds shadcn-generated primitives (button, dialog, slider, tooltip); `pages/` holds route-level screens, also with co-located `.css` files (Tailwind utility classes are the primary styling mechanism; the `.css` files hold overrides/animations).
- **Styling**: Tailwind v4 loaded via the Vite plugin (no `tailwind.config.js` — v4 CSS-first config lives in `src/index.css`/`src/styles/theme.css`).

**Docker**
- `Frontend/Dockerfile` is multi-stage: `builder` stage (`node:22-bookworm-slim`) runs `npm ci && npm run build`; runtime stage (`nginx:1.27-alpine`) serves the static `dist/` output on port 80.
- `VITE_API_BASE_URL` is baked into the JS bundle at Vite **build time**, so it's passed as a Docker `ARG`/`ENV` inside the builder stage (see `docker-compose.yml`'s `frontend.build.args`), not as a container runtime env var.
- `Frontend/nginx.conf` adds SPA fallback (`try_files $uri $uri/ /index.html`) so React Router v7 client-side routes don't 404 on refresh, plus long-lived cache headers for hashed static assets.
- `Frontend/.dockerignore` excludes `node_modules`, `dist`, `.env`, matching the intent of `Backend/.dockerignore`.

## Cross-cutting conventions
- Any new backend env var must be documented and added to `Backend/.env` (never committed) and, if needed at container runtime, surfaced through `docker-compose.yml`'s `env_file`.
- Frontend env vars use the `VITE_` prefix (Vite requirement to expose them to client code) and are read via `import.meta.env.VITE_*`; add new ones to both `Frontend/.env` (gitignored) and `Frontend/.env.example` (committed template).
- `docker-compose.yml` now wires four services: `redis`, `api` (port 3000), `worker`, and `frontend` (port 80, nginx). `frontend` reads `VITE_API_BASE_URL` from the host/root `.env` via compose variable substitution (`${VITE_API_BASE_URL:-http://localhost:3000}`) and passes it as a build arg — override it before `docker-compose up --build` if the API isn't reachable at `localhost:3000` from wherever the browser runs (e.g. a real deploy target).
- **Case-sensitivity gotcha**: macOS/Windows filesystems are case-insensitive, so an import like `"./navbar.css"` against an actual file `Navbar.css` will build fine locally but fail on Linux (Docker, most CI/deploy targets). Watch for this class of bug — it was hit once (`Navbar.jsx`) and silently worked until the frontend was containerized.
- **`npm ci` in a clean environment (no pre-existing `node_modules`) is the real test of `package.json`/`package-lock.json` correctness** — a stray/malformed dependency (e.g. a bad git-URL entry) can sit unnoticed in local dev because `node_modules` already has it cached, but breaks the first Docker build. Docker builds are a good forcing function to catch this.
