---
name: apiFetch contract
description: How apiFetch works in AuthContext — critical to get right in every new component that calls the API.
---

`apiFetch(path, init?)` in `artifacts/global-ai-hub/src/context/AuthContext.tsx`:

```ts
const res = await fetch(`${BASE}/api${path}`, { credentials: "include", ... });
const json = await res.json().catch(() => ({}));
if (!res.ok) throw Object.assign(new Error(...), { code, status });
return json;
```

**The rule:** it returns the already-parsed JSON object and throws on non-2xx. Never do `.ok` or `.json()` on its return value — that's the raw Response pattern and will fail.

**How to apply:**
- Path must NOT include `/api` prefix: use `"/security/threats"` not `"/api/security/threats"`.
- Wrap in try/catch: `try { const data = await apiFetch("/some/route"); } catch {}`
- For POST: `apiFetch("/some/route", { method: "POST", body: JSON.stringify({...}) })`

**Why:** apiFetch already fetches, parses, and validates. Callers that checked `.ok` or called `.json()` got TS errors and double-prefix bugs.
