import { getExecutiveSummaryRaw } from "./conversions-store.js";
import { getAdminActivityRaw } from "./playground-store.js";

const DAY_MS = 24 * 60 * 60 * 1000;
const SERIES_DAYS = 14;

function dayKey(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

function lastNDayKeys(n: number): string[] {
  const keys: string[] = [];
  const now = Date.now();
  for (let i = n - 1; i >= 0; i--) {
    keys.push(dayKey(now - i * DAY_MS));
  }
  return keys;
}

/**
 * Builds live revenue + usage time series for the Super Admin analytics
 * dashboard, bucketed by day for the trailing SERIES_DAYS window. Both
 * series are derived directly from the same in-memory stores that power
 * the existing Executive Counter / sandbox usage endpoints — no separate
 * or duplicated data source, so numbers always stay consistent.
 */
export function getAnalyticsOverview() {
  const days = lastNDayKeys(SERIES_DAYS);
  const revenueByDay = new Map<string, number>(days.map((d) => [d, 0]));
  const conversionsByDay = new Map<string, number>(days.map((d) => [d, 0]));
  const executionsByDay = new Map<string, number>(days.map((d) => [d, 0]));
  const widgetsByDay = new Map<string, number>(days.map((d) => [d, 0]));

  const { conversions } = getExecutiveSummaryRaw();
  for (const c of conversions) {
    const key = dayKey(c.createdAt);
    if (revenueByDay.has(key)) {
      revenueByDay.set(key, (revenueByDay.get(key) ?? 0) + c.amountUsdt);
      conversionsByDay.set(key, (conversionsByDay.get(key) ?? 0) + 1);
    }
  }

  const { widgets } = getAdminActivityRaw();
  for (const w of widgets) {
    const key = dayKey(w.createdAt);
    if (widgetsByDay.has(key)) {
      widgetsByDay.set(key, (widgetsByDay.get(key) ?? 0) + 1);
    }
  }

  // Sandbox executions aren't individually timestamped (only aggregate counts
  // are tracked per user), so today's bucket carries the live running total
  // while historical days show 0 — this keeps the chart honest about what is
  // actually live data versus synthetic backfill.
  const { totalExecutions } = getAdminActivityRaw();
  const todayKey = days[days.length - 1];
  executionsByDay.set(todayKey, totalExecutions);

  return {
    revenueSeries: days.map((d) => ({ date: d, revenueUsdt: Math.round((revenueByDay.get(d) ?? 0) * 100) / 100 })),
    conversionSeries: days.map((d) => ({ date: d, conversions: conversionsByDay.get(d) ?? 0 })),
    usageSeries: days.map((d) => ({
      date: d,
      executions: executionsByDay.get(d) ?? 0,
      widgetsCreated: widgetsByDay.get(d) ?? 0,
    })),
  };
}
