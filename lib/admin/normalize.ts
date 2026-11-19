/**
 * Firestore documents in this project were written by several code paths over time, so
 * date fields may be ISO strings, epoch numbers, Firestore Timestamps, or missing.
 * The admin API always returns ISO strings (or undefined) so the UI can sort/format safely.
 */
export function toIso(v: unknown): string | undefined {
  if (v === null || v === undefined || v === "") return undefined;
  if (typeof v === "string") {
    const t = Date.parse(v);
    return Number.isFinite(t) ? new Date(t).toISOString() : undefined;
  }
  if (typeof v === "number") {
    // seconds vs milliseconds
    const ms = v < 1e12 ? v * 1000 : v;
    return Number.isFinite(ms) ? new Date(ms).toISOString() : undefined;
  }
  if (v instanceof Date) return Number.isFinite(v.getTime()) ? v.toISOString() : undefined;
  if (typeof v === "object") {
    const o = v as any;
    if (typeof o.toDate === "function") {
      try {
        return o.toDate().toISOString();
      } catch {
        return undefined;
      }
    }
    const secs = o.seconds ?? o._seconds;
    if (typeof secs === "number") return new Date(secs * 1000 + Math.floor((o.nanoseconds ?? o._nanoseconds ?? 0) / 1e6)).toISOString();
  }
  return undefined;
}

export function normalizeDates<T extends Record<string, any>>(obj: T, keys: string[]): T {
  const out: Record<string, any> = { ...obj };
  for (const k of keys) {
    if (k in out) out[k] = toIso(out[k]);
  }
  return out as T;
}

export const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : v === null || v === undefined ? fallback : String(v);
