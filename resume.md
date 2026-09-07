# resume.md — Task Tracker

> **SYSTEM RULE (strict, always enforced):**
> The moment a task's status is set to **Ended/Completed**, its entry must be immediately scrubbed down to the minimal summary line before this file is saved. "Scrubbed" means: **remove** verbose requirement notes, code snippets, diffs, file dumps, and step-by-step history. **Keep only**: task title, one-line outcome, and completion date. This file must never be allowed to grow unbounded with historical implementation detail — that detail belongs in git history and PRs, not here. Agent 4 (Doc Manager) is responsible for performing this scrub as its final action on every task.

---

## Active Tasks

_None yet._

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

<!--
Template for a completed task entry (post-scrub, Agent 4 writes this and only this):

### [Task Title] — Completed YYYY-MM-DD
One-line outcome of what shipped.
-->
