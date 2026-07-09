---
name: Orval inline body schema name collisions
description: Why lib/api-zod typecheck fails with TS2308 duplicate export errors after adding OpenAPI endpoints, and how to avoid it
---

Inline (non-`$ref`) request body schemas in `openapi.yaml` get auto-named by orval from the `operationId` (e.g. `PostChatMessageBody`). The zod codegen target and the react-query codegen target both generate a type with that same name, and since `lib/api-zod/src/index.ts` does `export * from "./generated/api"` and `export * from "./generated/types"`, this causes `TS2308: Module has already exported a member named 'X'` during `pnpm run typecheck:libs`.

**Why:** orval's default naming for anonymous inline schemas collides across its two generator targets when both are re-exported from the same barrel file.

**How to apply:** Always give POST/PATCH/PUT request bodies a named schema under `components.schemas` (e.g. `ChatMessageInput`) and reference it with `$ref` instead of inlining `type: object` directly in `requestBody.content.application/json.schema`. Existing working examples in this repo (e.g. `JobApplicationInput`) already follow this pattern — mirror it for all new endpoints.
