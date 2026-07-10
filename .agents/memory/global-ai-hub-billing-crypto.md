---
name: Global AI Hub billing/crypto checkout flow
description: How the simulated USDT (Binance Pay-style) checkout and plan upgrade works, and the TxID format it accepts.
---

The billing flow is fully simulated (no real blockchain calls): `POST /billing/checkout` creates a session with a fake generated wallet address and a 15-minute expiry; `POST /billing/verify` accepts a `txId` and validates it against a regex requiring **pure hex characters, 16+ length, no `0x` prefix**. A `0x`-prefixed hash will fail validation since `x` is not a hex digit.

On successful verify, the session is marked `confirmed` and the user's `plan` is upgraded via `upgradeUserPlan()`, which is reflected immediately in `GET /auth/me` and should be synced into the client's auth context (`setUser`) so the dashboard's Pro banner updates without a full reload.

**Why:** avoids needing a real crypto payment integration for a demo/mock feature while still exercising a realistic checkout → verify → entitlement-upgrade flow.

**How to apply:** when testing or extending checkout, always pass hex-only TxIds (e.g. `a1b2c3d4e5f60718293a4b5c6d7e8f90`) instead of realistic `0x...` hashes, or extend the regex first if real-looking hashes are required.
