---
name: IP-based hard blocking self-lockout
description: Testing exploit/threat-detection features can lock out the tester's own admin session because blocks are IP-scoped, not user-scoped.
---

When a threat-defense system hard-blocks an IP (after N suspicious requests), the block applies to every request from that IP — including an admin's own authenticated session if it shares the IP with the "attacker" traffic (common in dev/testing where curl and the browser both hit the shared proxy from the same address).

**Why:** IP-based blocking has no concept of "this is actually the admin testing." A 3rd suspicious request from an admin's own dev session can 403 all subsequent calls (including `/api/auth/me`), causing the frontend's auth layer to treat it as a session expiry and force a logout/redirect to login.

**How to apply:** When testing/QA'ing exploit-detection or rate-limiting features:
- Trigger only up to the pre-block warning limit (e.g. stop at attempt 2 of a 3-strike system) from the session you need to stay authenticated in.
- If you need to test the actual hard-block path, use a separate IP/context, or accept the lockout and restart the affected backend workflow to clear the in-memory block afterward.
