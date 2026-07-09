---
name: Global AI Hub token rewards
description: How the AI Hub Tokens reward/leaderboard/wallet system relates to the pre-existing Hub Points system
---

Global AI Hub has two separate, non-overlapping reward systems:

1. **Hub Points** (pre-existing) — client-side only, stored in `SocialContext` via localStorage. Drives the dashboard tier badge (Newcomer/Explorer/Innovator/Visionary) and per-tool like/comment/share/bookmark counts in `ToolSocialBar`.
2. **AI Hub Tokens** (added later) — backend-persisted (in-memory store on the API server), drives the cross-user Leaderboard, level badges (Bronze/Silver/Gold/Platinum), and the Rewards Wallet redemption catalog.

**Why:** Hub Points needed no backend since it's per-user only; the Leaderboard requires a backend because it spans multiple users, so a new parallel system was added rather than migrating the old one (would have required a larger refactor and risked breaking existing tool social-bar behavior).

**How to apply:** When adding new engagement actions, decide which system they belong to — cosmetic per-tool engagement counters stay in `SocialContext`; anything that should show up on the cross-user leaderboard or be redeemable should call the `useEarnTokens` hook (`artifacts/global-ai-hub/src/hooks/useEarnTokens.ts`), which wraps the generated `useEarnTokens` mutation and invalidates `["getMyTokenBalance"]` / `["getLeaderboard"]`. Don't try to unify the two balances — they intentionally track different things.
