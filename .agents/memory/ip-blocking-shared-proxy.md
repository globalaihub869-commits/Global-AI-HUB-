---
name: IP-based auto-blocking in shared dev proxy
description: Automated threat-defense / bot-blocking systems must scope hard IP blocks to sensitive routes, not every request
---
In this Replit environment, dev/preview traffic (browser via the proxy, and bash `curl` testing) can appear to the app server as originating from the same local IP. A middleware that hard-blocks an IP for *any* request matching a broad signal (e.g. a scripted user-agent like `curl/`, `python-requests`) will end up blocking all traffic from that shared IP — including legitimate browser users — the moment any test script or health check hits it.

**Why:** A blanket "block IP on bot-signature/rate-abuse for every route" rule self-DOSed the whole dev environment during verification: one `curl` login attempt tripped a UA-based block, and the resulting IP ban then rejected every subsequent request (browser and API) for the block duration.

**How to apply:** When building auto-block / threat-defense logic (bot UA detection, rate limiting, etc.), scope the most aggressive rules (hard IP bans) to genuinely sensitive endpoints (e.g. `/auth/login`, `/auth/signup`) rather than applying them globally to every route. Keep broader protections (exploit-path patterns, brute-force login attempts) but favor logging/flagging over blocking for anything that could plausibly be a shared-IP false positive. Also set `app.set("trust proxy", true)` in Express so `req.ip` reflects `X-Forwarded-For` in production, since without it every request behind a reverse proxy shows the same source IP.
