---
name: React Query mutation invalidation
description: Orval-generated mutation hooks (usePostX, useApplyToX, etc.) do not automatically refresh related list queries after success.
---

When using orval-generated React Query hooks (`@workspace/api-client-react`), a mutation hook like `usePostJob` only performs the POST — it does not know about or invalidate the `useListJobs` query cache.

**Why:** Orval generates mutation and query hooks independently; there's no built-in relationship between them, so newly created/updated records won't show up in list views until the cache is invalidated or refetched.

**How to apply:** In the mutation's `onSuccess` callback, call `queryClient.invalidateQueries({ queryKey: ["listXxx"] })` (matching the query key used in the corresponding `useListXxx` call) to force a refetch. Import `useQueryClient` from `@tanstack/react-query`. This was needed for the Jobs board "Post a Job" flow so newly posted jobs appear in the grid immediately.
