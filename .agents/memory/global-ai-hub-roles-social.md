---
name: Global AI Hub — admin role & social engagement state
description: How Super Admin access is granted and where Like/Comment/Share/Bookmark + Hub Points state lives
---

Super Admin role is assigned automatically at signup: any email whose local-part starts with "admin" (case-insensitive) gets `role: "admin"` server-side in `users.ts`; everyone else gets `role: "user"`. There is no admin invite/promotion UI.

**Why:** the backend is an in-memory demo store with no seeding mechanism, so a deterministic email-based rule was the simplest way to let the user create a Super Admin account for the `/admin` dashboard without extra tooling.

**How to apply:** to test or demo the Super Admin Dashboard, sign up with an email like `admin@example.com`. `/admin` is guarded client-side in `App.tsx` (`AdminGuard`) and shows an "Access Restricted" state for non-admins rather than a 404.

Tool social engagement (Like/Comment/Share/Bookmark counts, Hub Points, notifications) is **not** persisted server-side — it lives entirely client-side in `SocialContext.tsx`, keyed to `localStorage` per logged-in user id (falls back to a "guest" bucket when signed out). Any future backend/DB migration for this data needs a new API + schema; it does not currently round-trip through `api-server`.
