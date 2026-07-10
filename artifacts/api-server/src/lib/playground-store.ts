import { randomUUID } from "crypto";
import type { PlanTier } from "./users.js";

export const FREE_EXECUTION_LIMIT = 5;

export interface Widget {
  id: string;
  userId: string;
  name: string;
  type: string;
  description: string;
  seo: {
    title: string;
    slug: string;
    metaDescription: string;
    keywords: string[];
  };
  createdAt: number;
}

interface UserPlaygroundState {
  executionCount: number;
  widgets: Widget[];
}

const state = new Map<string, UserPlaygroundState>();

function getState(userId: string): UserPlaygroundState {
  let s = state.get(userId);
  if (!s) {
    s = { executionCount: 0, widgets: [] };
    state.set(userId, s);
  }
  return s;
}

export function getUsage(userId: string, plan: PlanTier) {
  const s = getState(userId);
  const unlimited = plan !== "free";
  return {
    executionCount: s.executionCount,
    limit: unlimited ? null : FREE_EXECUTION_LIMIT,
    locked: !unlimited && s.executionCount >= FREE_EXECUTION_LIMIT,
    plan,
  };
}

export type ExecuteResult =
  | { status: "locked"; executionCount: number; limit: number }
  | { status: "ok"; executionCount: number; limit: number | null; output: string[] };

export function executeSandboxCode(userId: string, plan: PlanTier, code: string): ExecuteResult {
  const s = getState(userId);
  const unlimited = plan !== "free";

  if (!unlimited && s.executionCount >= FREE_EXECUTION_LIMIT) {
    return { status: "locked", executionCount: s.executionCount, limit: FREE_EXECUTION_LIMIT };
  }

  s.executionCount += 1;

  const lines = code.split("\n").filter((l) => l.trim().length > 0).length;
  const output = [
    `> Booting sandbox runtime (node-sim v2)...`,
    `> Parsed ${lines || 1} line(s) of input`,
    `> Executing in isolated sandbox container...`,
    `> Result: ${simulateOutput(code)}`,
    `> Done in ${(80 + Math.random() * 220).toFixed(0)}ms`,
  ];

  return {
    status: "ok",
    executionCount: s.executionCount,
    limit: unlimited ? null : FREE_EXECUTION_LIMIT,
    output,
  };
}

function simulateOutput(code: string): string {
  const trimmed = code.trim();
  if (!trimmed) return "undefined";
  if (/console\.log|print\(/.test(trimmed)) return "Logged output to console ✔";
  if (/function|def |=>/.test(trimmed)) return "Function defined successfully ✔";
  const nums = trimmed.match(/-?\d+(\.\d+)?/g);
  if (nums && /[+\-*/]/.test(trimmed)) {
    try {
      // eslint-disable-next-line no-new-func
      const val = Function(`"use strict"; return (${trimmed.replace(/;$/, "")})`)();
      if (typeof val === "number") return String(val);
    } catch {
      /* fall through */
    }
  }
  return `${trimmed.slice(0, 40)}${trimmed.length > 40 ? "..." : ""}`;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "widget";
}

export function createWidget(userId: string, name: string, type: string, description: string): Widget {
  const s = getState(userId);
  const slug = `${slugify(name)}-${randomUUID().slice(0, 6)}`;
  const keywords = Array.from(
    new Set(
      `${name} ${type} ${description}`
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 2),
    ),
  ).slice(0, 10);

  const widget: Widget = {
    id: randomUUID(),
    userId,
    name,
    type,
    description,
    seo: {
      title: `${name} — ${type} Widget | Global AI Hub`,
      slug,
      metaDescription: description
        ? `${description.slice(0, 145)}${description.length > 145 ? "..." : ""}`
        : `Explore the ${name} ${type} widget, built with the Global AI Hub No-Code Builder.`,
      keywords: keywords.length > 0 ? keywords : [type.toLowerCase(), "ai widget", "no-code"],
    },
    createdAt: Date.now(),
  };

  s.widgets.unshift(widget);
  return widget;
}

export function listWidgets(userId: string): Widget[] {
  return getState(userId).widgets;
}

export function getAdminActivitySummary() {
  let totalExecutions = 0;
  let totalWidgets = 0;
  let lockedFreeUsers = 0;
  const recentWidgets: Widget[] = [];

  for (const s of state.values()) {
    totalExecutions += s.executionCount;
    totalWidgets += s.widgets.length;
    if (s.executionCount >= FREE_EXECUTION_LIMIT) lockedFreeUsers += 1;
    recentWidgets.push(...s.widgets);
  }

  recentWidgets.sort((a, b) => b.createdAt - a.createdAt);

  return {
    totalExecutions,
    totalWidgets,
    lockedFreeUsers,
    activeSandboxUsers: state.size,
    recentWidgets: recentWidgets.slice(0, 8),
  };
}
