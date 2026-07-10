---
name: Admin data stores
description: All admin/security data is in-memory — resets on server restart, by design for the current demo stage.
---

**In-memory stores in `artifacts/api-server/src/lib/`:**
- `threat-store.ts` — blocked IPs, pre-block warning counts, action log entries
- `conversions-store.ts` — paid conversions (`getExecutiveSummary()` → `{ totalConversions, highValueConversions, totalRevenueUsdt, enterpriseCount, proCount, recentConversions }`)
- `vip-emailer.ts` — VIP welcome email log

**Why:** Fast iteration; no DB migration overhead for demo. When persisting to DB, add a `security_events` table and a `vip_emails` table in `lib/db/src/schema.ts`, then run `pnpm --filter @workspace/db run push`.

**Key shapes used by admin components:**
- `/security/executive-summary` → `getExecutiveSummary()` shape (NOT a `{ summary: ... }` wrapper — the object IS the response)
- `/security/action-log` → `{ actions: ActionLogEntry[] }` (not `{ log: ... }`)
- `/vip/emails` → `{ emails: VipEmail[] }`
