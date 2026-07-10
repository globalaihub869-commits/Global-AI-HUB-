---
name: api-server has no dev watch mode
description: Code changes to artifacts/api-server are not picked up automatically; the workflow must be restarted.
---

The `@workspace/api-server` dev script runs `build` then `start` once (no watch/reload). Editing server code (routes, lib files) will not take effect until the `artifacts/api-server: API Server` workflow is restarted.

**Why:** Discovered when a new field added to a route response didn't appear in API responses despite the source change being correct — the running process was still serving the previously built `dist/index.mjs`.

**How to apply:** After any backend change in `artifacts/api-server`, restart its workflow before testing/verifying the change (via curl, code_execution fetch, or browser).
