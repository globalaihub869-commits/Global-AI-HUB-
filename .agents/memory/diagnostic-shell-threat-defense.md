---
name: Diagnostic shell vs threat defense
description: Rapid curl probes from localhost trigger the IP auto-block — restart API Server to clear during dev.
---

During Step 18 final diagnostic, rapid-fire curl requests from the bash shell triggered the in-memory IP auto-block system (threat defense, Steps 13-14). All subsequent requests — including public routes — returned `{"error":"ACCESS_BLOCKED"}`.

**Why:** The threat defense tracks request frequency per IP. The bash diagnostic loop exceeded the threshold in under 10 seconds, triggering a hard block on `127.0.0.1`.

**How to apply:** Before running diagnostic curl sweeps, add `sleep 0.5`–`1` between calls, or restart the API Server workflow to clear the in-memory block. This is expected behavior — the system is working correctly.
