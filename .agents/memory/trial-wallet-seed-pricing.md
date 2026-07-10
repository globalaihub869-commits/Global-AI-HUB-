---
name: Trial wallet seed pricing
description: Marketplace/gigs demo purchase flows need at least some catalog items priced at or below the simulated starting wallet balance.
---

When a product spec calls for a small simulated "trial wallet" balance (e.g. $5) that gates purchases in a marketplace/gigs-style feature, check the seeded catalog prices before considering the purchase flow done.

**Why:** It's easy to seed all catalog items at realistic marketplace prices ($9-$89) that all exceed a small trial balance, so every purchase attempt returns "insufficient balance" and the success path (wallet debit, activity feed update, escrow release) is never exercised end-to-end — silently breaking the demo experience.

**How to apply:** After wiring a wallet-gated purchase endpoint, test at least one purchase against the cheapest seeded item via curl/API call, not just the UI. If nothing is affordable, add one or two intentionally cheap items so the full success path is reachable.
