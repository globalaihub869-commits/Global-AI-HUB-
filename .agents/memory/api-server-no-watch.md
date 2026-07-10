---
name: api-server dev has no watch mode
description: Backend changes require a manual workflow restart to take effect
---
The `artifacts/api-server` dev script rebuilds once and runs the bundle — it does not watch for file changes.

**Why:** Editing `.ts` route/lib files under `artifacts/api-server/src` has no effect on the running server until it's restarted; testing against stale code wastes time and causes confusing "it doesn't work" results.

**How to apply:** After any change to `artifacts/api-server/src/**`, restart the `artifacts/api-server: API Server` workflow before curling or testing the API.
