---
name: Global AI Hub tier/growth engine
description: How plan limits, referral rewards, and admin analytics relate in Global AI Hub — read before adding monetization or growth features.
---

The Super Admin analytics endpoint (`/analytics/overview`) computes its time series directly from the same in-memory stores that already power the Executive Counter and sandbox-activity endpoints (conversions store, playground store) rather than maintaining a separate aggregate. Referral reward points are capped per-tier using a rolling 30-day window, keyed off the same plan-limits config used for widget/sandbox execution caps.

**Why:** the app has no persistent DB for these features (in-memory stores), so any new feature that duplicates a metric instead of deriving it from the existing store will silently drift out of sync with the numbers shown elsewhere in the admin dashboard.

**How to apply:** when adding new tier-gated features or admin-visible metrics, extend the existing stores (`plan-limits.ts`, `referral-store.ts`, `analytics-store.ts`, `conversions-store.ts`, `playground-store.ts`) rather than creating parallel counters. Keep signup/referral/billing changes additive (e.g. optional params) so existing auth/billing/threat-defense flows stay untouched.
