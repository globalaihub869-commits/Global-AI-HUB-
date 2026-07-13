// Rolling request/error counter — tracks real API traffic in 3-second buckets.
// Used by /admin/realtime-stats to power the live traffic chart and stat tiles.

const BUCKET_MS = 3_000;
const MAX_BUCKETS = 22; // keep a bit more than we ever display

interface Bucket {
  ts: number;   // epoch ms, start of the bucket
  requests: number;
  errors: number;
}

const buckets: Bucket[] = [];

function activeBucket(): Bucket {
  const now = Date.now();
  const ts = Math.floor(now / BUCKET_MS) * BUCKET_MS;
  const last = buckets[buckets.length - 1];
  if (last?.ts === ts) return last;
  const b: Bucket = { ts, requests: 0, errors: 0 };
  buckets.push(b);
  while (buckets.length > MAX_BUCKETS) buckets.shift();
  return b;
}

/** Call once per completed request (from the res.on("finish") middleware). */
export function recordRequest(isError: boolean): void {
  const b = activeBucket();
  b.requests++;
  if (isError) b.errors++;
}

/** Total requests completed in the last 60 seconds. */
export function getRequestsPerMin(): number {
  const cutoff = Date.now() - 60_000;
  return buckets.filter((b) => b.ts >= cutoff).reduce((s, b) => s + b.requests, 0);
}

/** Error rate (%) over the last 60 seconds. */
export function getErrorRate(): number {
  const cutoff = Date.now() - 60_000;
  const recent = buckets.filter((b) => b.ts >= cutoff);
  const total = recent.reduce((s, b) => s + b.requests, 0);
  const errors = recent.reduce((s, b) => s + b.errors, 0);
  return total === 0 ? 0 : (errors / total) * 100;
}

/**
 * Returns the last 20 buckets (each 3 seconds) as `{ t, requests }` points
 * for the sparkline chart — always exactly 20 entries, zero-padded when sparse.
 */
export function getTrafficHistory(): { t: number; requests: number }[] {
  const now = Date.now();
  const result: { t: number; requests: number }[] = [];
  for (let i = 19; i >= 0; i--) {
    const ts = Math.floor((now - i * BUCKET_MS) / BUCKET_MS) * BUCKET_MS;
    const b = buckets.find((bk) => bk.ts === ts);
    result.push({ t: ts, requests: b?.requests ?? 0 });
  }
  return result;
}
