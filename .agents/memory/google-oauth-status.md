---
name: Google OAuth status
description: Current state of Google OAuth integration — frontend only, backend not wired.
---

**What exists:** A `GoogleOAuthButton` component renders on `/login` and `/signup` with the real Google logo. Gracefully shows an informational alert if `VITE_GOOGLE_CLIENT_ID` is not set.

**What's missing to go live:**
1. Set `VITE_GOOGLE_CLIENT_ID` in Replit Secrets (from Google Cloud Console OAuth 2.0 credentials).
2. Implement the backend callback: `GET /api/auth/google/callback` — exchange code for token, fetch user profile, upsert user in DB, create session.
3. Wire the button's `onClick` to `window.location.href = "/api/auth/google"` (the initiation route).

**Why stopped here:** User requested frontend-only UI for now; backend OAuth is a separate task.
