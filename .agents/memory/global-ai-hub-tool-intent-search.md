---
name: Global AI Hub tool intent search
description: How natural-language tool discovery is implemented across the tools search API and the Aria assistant widget
---

Tool search supports free-text intent queries (e.g. "I want to make a video for my shop", "help me write code"), not just substring matching.

The intent-to-tool mapping (phrases -> domains/output types/tags) lives server-side, not duplicated per-consumer.

**Why:** Both the Tools page search bar and the Aria assistant widget need identical results for the same query — keeping the mapping in one place (backend) and having the widget call the same `/api/tools?search=` endpoint (rather than re-implementing matching client-side) guarantees consistency and avoids drift.

**How to apply:** When adding another surface that needs tool recommendations (e.g. a future onboarding flow or a different assistant), call the existing `/api/tools?search=` endpoint and read `intentSummary` from the response rather than writing a new keyword map. Extend the intent rules in one place if new phrasings need support.
