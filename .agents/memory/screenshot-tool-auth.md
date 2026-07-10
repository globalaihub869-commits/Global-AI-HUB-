---
name: screenshot tool has its own browser session
description: app_preview screenshots can't reuse cookies set via curl/bash
---
The `screenshot` tool's `app_preview` browser session is independent from any cookie jar set via `curl` in bash. Logging in with curl (e.g. to get a session cookie for API testing) does not authenticate the screenshot tool's browser.

**Why:** Attempting to screenshot an auth-gated page after only curl-based login will still show the login screen, which can look like a bug when it's just a separate session.

**How to apply:** For visually verifying auth-gated pages, prefer backend curl verification (fast, reliable) over trying to get the screenshot tool into an authenticated state; treat screenshot verification of gated pages as best-effort only.
