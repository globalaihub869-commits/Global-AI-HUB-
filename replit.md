# Global AI Hub

A dark/purple/cyan neon-themed hub for discovering, testing, and building with AI tools — including a marketplace, admin dashboard, and an embedded AI sandbox/no-code builder.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm run typecheck` — full typecheck across all packages (canonical check — trust this over editor LSP)
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (port 8080)
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- Frontend: React + Vite, Tailwind CSS, Framer Motion, shadcn/ui

## Where things live

- **DB schema**: `lib/db/src/schema.ts`
- **API contract (OpenAPI)**: `lib/api-spec/openapi.yaml`
- **Generated hooks + Zod schemas**: `lib/api-spec/src/generated/`
- **Theme CSS vars**: `artifacts/global-ai-hub/src/index.css`
- **Theme context**: `artifacts/global-ai-hub/src/context/ThemeContext.tsx`
- **Auth context + apiFetch**: `artifacts/global-ai-hub/src/context/AuthContext.tsx`
- **API routes entry**: `artifacts/api-server/src/routes/index.ts`
- **Security routes**: `artifacts/api-server/src/routes/security.ts`
- **VIP emailer route**: `artifacts/api-server/src/routes/vip.ts`
- **Threat/conversion store**: `artifacts/api-server/src/lib/threat-store.ts`, `conversions-store.ts`

## Architecture decisions

- **`apiFetch(path)`** prepends `BASE + "/api"` automatically and returns parsed JSON (throws on error). Never check `.ok` or call `.json()` on its return value. Never prefix `path` with `/api`.
- **Dark/light mode** uses a `.dark` class on `<html>`, toggled by `ThemeContext`. CSS vars in `index.css` power both themes. A 450ms `.theme-transitioning` class is added during toggle for smooth transitions.
- **Admin security data is in-memory** (threat store, conversions store, action log, VIP email log). It resets on server restart — by design for demo purposes.
- **IP blocking** is progressive: first 2 suspicious attempts per IP get a warning banner; 3rd+ triggers a hard block. Unblockable via admin 1-click.
- **Live SSE stream** at `/api/security/live-stream` pushes `threat_blocked`, `purchase`, and `ip_unblocked` events to the admin dashboard in real time.

## Product

### Super Admin Dashboard (`/admin`)
- **Hacker Action Log** — every suspicious request logged with IP, method, path, severity, and block status. Severity filter chips (critical/high/medium/low). Live badge counter. Auto-refreshes every 3s.
- **Live Revenue Tracker** — pulls from `/security/executive-summary`. Animated count-up metrics (total revenue, conversions, pro/enterprise counts). Updates every 5s.
- **VIP Welcome Emailer** — in-memory log of enterprise welcome emails. Expandable detail drawer. "Send Demo VIP Email" button for testing.
- **Blocked IP Management** — 1-click unblock panel.
- **Live SSE push notifications** — sound + toast alerts for purchases and blocked threats.
- **Pre-block warning mechanism** — first 2 suspicious attempts get a warning; 3rd+ = hard block.

### Auth
- Email/password signup + login.
- **Google OAuth button** on login and signup pages (`Continue with Google` / `Sign up with Google`). Frontend-only UI ready; backend OAuth callback not yet wired. Requires `VITE_GOOGLE_CLIENT_ID` env var to activate — shows a graceful informational alert if missing.
- First user to sign up gets `role: admin` automatically.

### Theme
- **Dark/Light Mode Toggle** in the navbar (moon/sun icon, cyan neon glow). Persists to `localStorage`. Smooth 350ms CSS transitions on background, border, and text color.

## User preferences

- Typecheck is always the canonical correctness check (`pnpm run typecheck`), not the editor LSP.
- Deploy tomorrow morning — codebase is frozen at checkpoint `68b3f33`.

## Gotchas

- **Never double-prefix `apiFetch` paths with `/api`** — it already prepends it. Paths should look like `"/security/threats"`, not `"/api/security/threats"`.
- **Never call `.ok` or `.json()` on `apiFetch` return** — it returns parsed JSON directly and throws `Error` on non-ok responses. Wrap in `try/catch`.
- **Do not run `pnpm dev` or `pnpm run dev` at the workspace root** — it has no `dev` script. Use workflows or `restart_workflow`.
- **VIP email log and conversion data are in-memory** — they reset on API server restart.
- To wire up real Google OAuth: set `VITE_GOOGLE_CLIENT_ID` in Secrets, then implement `/api/auth/google/callback` on the backend.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
