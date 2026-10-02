# resume.md — Task Tracker

> **SYSTEM RULE (strict, always enforced):**
> The moment a task's status is set to **Ended/Completed**, its entry must be immediately scrubbed down to the minimal summary line before this file is saved. "Scrubbed" means: **remove** verbose requirement notes, code snippets, diffs, file dumps, and step-by-step history. **Keep only**: task title, one-line outcome, and completion date. This file must never be allowed to grow unbounded with historical implementation detail — that detail belongs in git history and PRs, not here. Agent 4 (Doc Manager) is responsible for performing this scrub as its final action on every task.

---

## Active Tasks

### Deploy BingeBox to AWS via ECR + ECS
- **Status:** In Progress — ECR repo creation + image build/push commands provided
- **Requirement:** User wants to deploy the containerized app (frontend, api, worker) to AWS using ECR (image registry) and ECS (container orchestration). First deliverable is the full deployment flow/plan; implementation (task defs, CI/CD, infra) follows once the user confirms direction.
- **Scope / Edge cases:**
  - `redis` is a plain container in `docker-compose.yml` today — on ECS this must become a managed **ElastiCache for Redis** instance; ECS tasks are ephemeral and BullMQ needs a stable, persistent broker reachable by both `api` and `worker`.
  - `Backend/.env` (Supabase keys, Redis URL, etc.) is gitignored and supplied via `env_file` locally — on ECS these must move to **AWS Secrets Manager / SSM Parameter Store**, injected via the task definition's `secrets` block, never baked into the image.
  - `Frontend/Dockerfile` bakes `VITE_API_BASE_URL` in at **build time** (Vite ARG/ENV) — the API's public URL/domain must be decided (and stable, e.g. an ALB DNS name or custom domain) before the frontend image is built in CI, or the frontend must be rebuilt whenever that URL changes.
  - Need **3 ECR repositories** (api, worker, frontend) matching the 3 Dockerfiles; `worker` needs no ALB target (no inbound HTTP), just egress to Redis/Supabase.
  - `worker` concurrency is hardcoded to 1 per process (`workers/video.worker.ts`) — horizontal scaling for transcoding throughput means scaling the ECS **service's task count**, not in-process concurrency.
  - Raw uploads no longer touch disk (Supabase Storage); only the worker's ffmpeg HLS scratch dir under `/tmp/` uses the container's ephemeral storage — fine under Fargate's default (20GB, configurable to 200GB) as long as cleanup-on-every-exit-path (already a repo rule) holds; no EFS needed unless large files break that ceiling.
  - Networking: VPC with public+private subnets, ALB in front of `api` and `frontend` (or frontend served via S3+CloudFront instead of ECS — open decision), security groups scoping worker/api egress to Redis+Supabase only.
- **Notes:** No code changes yet — this task starts as a planning/flow deliverable. Agent 2 implementation work (task defs, CI/CD pipeline, Terraform/CDK or console steps) is a follow-up once the user picks concrete options (region, Fargate vs EC2 launch type, CI tool, frontend hosting choice).

<!--
Template for an active task entry (Agent 1 fills this in when scoping):

### [Task Title]
- **Status:** Scoped / In Progress / In Review
- **Requirement:** one or two sentences, the actual ask.
- **Scope / Edge cases:** bullet list from Agent 1's clarification pass.
- **Files touched:** paths, updated as Agent 2 works.
- **Notes:** anything Agent 2/3 need to hand off between steps.
-->

---

## Completed Tasks

### Fix port mismatch and hardcoded frontend URLs — Completed 2026-09-06
Backend port is now env-driven (`process.env.PORT`, default 3000) and matches `Dockerfile.api`/`docker-compose.yml`; frontend services read `VITE_API_BASE_URL` instead of hardcoding `localhost:3000`.

### Containerize the frontend for deployment — Completed 2026-09-08
Added `Frontend/Dockerfile` (Vite build → nginx) + `nginx.conf` (SPA fallback) + `frontend` service in `docker-compose.yml`; also fixed a bad `"root": "github:tanstack/react-query"` dependency and a `navbar.css`/`Navbar.css` case-sensitivity import bug that only broke on Linux/Docker.

### Add Redis password auth support to `redis.ts` — Completed 2026-09-17
`config/redis.ts` now passes `password: process.env.REDIS_PASSWORD` to the `IORedis` client, optional and backward-compatible with unauthenticated local Redis.

### Store raw uploads in Supabase Storage instead of local disk — Completed 2026-10-02
API buffers uploads in memory and pushes them to Supabase Storage; the worker has ffmpeg stream the original from a signed URL, so neither process writes the raw video to disk.

<!--
Template for a completed task entry (post-scrub, Agent 4 writes this and only this):

### [Task Title] — Completed YYYY-MM-DD
One-line outcome of what shipped.
-->
