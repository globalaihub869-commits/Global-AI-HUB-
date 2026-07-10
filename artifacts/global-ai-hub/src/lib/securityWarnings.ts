export interface SecurityWarning {
  id: string;
  reason: string;
  attemptNumber: number;
  createdAt: number;
}

type Listener = (warning: SecurityWarning) => void;

const listeners = new Set<Listener>();

export function subscribeSecurityWarnings(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function emitSecurityWarning(reason: string, attemptNumber: number) {
  const warning: SecurityWarning = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    reason,
    attemptNumber,
    createdAt: Date.now(),
  };
  listeners.forEach((l) => l(warning));
}

/** Reads the `X-Security-Warning` header set by the backend's pre-block mechanism and broadcasts it, if present. */
export function checkForSecurityWarning(res: Response) {
  const raw = res.headers.get("X-Security-Warning");
  if (!raw) return;
  try {
    const parsed = JSON.parse(raw) as { reason: string; attemptNumber: number };
    emitSecurityWarning(parsed.reason, parsed.attemptNumber);
  } catch {
    // ignore malformed header
  }
}
