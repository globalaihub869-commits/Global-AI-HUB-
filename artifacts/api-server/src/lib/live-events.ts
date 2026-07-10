import { EventEmitter } from "events";
import { randomUUID } from "crypto";

/**
 * Lightweight pub/sub bus for Live Audio/Visual Push Notifications on the
 * Super Admin Dashboard. Kept in-memory and process-local (matches the rest
 * of this app's in-memory store pattern) — any module can publish, and the
 * SSE route in routes/security.ts subscribes to stream events to admins.
 */

export type LiveEventType = "threat_blocked" | "purchase" | "ip_unblocked" | "vip_ticket";

export interface LiveEvent {
  id: string;
  type: LiveEventType;
  title: string;
  message: string;
  createdAt: number;
}

const emitter = new EventEmitter();
emitter.setMaxListeners(50);
const EVENT_NAME = "live-event";

export function publishLiveEvent(event: Omit<LiveEvent, "id" | "createdAt">): LiveEvent {
  const full: LiveEvent = { ...event, id: randomUUID(), createdAt: Date.now() };
  emitter.emit(EVENT_NAME, full);
  return full;
}

export function subscribeLiveEvents(listener: (event: LiveEvent) => void): () => void {
  emitter.on(EVENT_NAME, listener);
  return () => emitter.off(EVENT_NAME, listener);
}
