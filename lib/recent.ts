/**
 * Recently-viewed hymns, persisted in localStorage as an LRU list of slugs.
 * Capped at 10 entries. Safe to call on the server — all functions short-circuit
 * to an empty result when `window` is unavailable.
 */
const KEY = "worship-chord:recent";
const MAX = 10;

export function getRecent(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr.filter((x): x is string => typeof x === "string").slice(0, MAX);
  } catch {
    return [];
  }
}

export function addRecent(slug: string) {
  if (typeof window === "undefined") return;
  if (!slug || typeof slug !== "string") return;
  try {
    const existing = getRecent().filter((s) => s !== slug);
    const next = [slug, ...existing].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* quota exceeded or storage disabled — silently ignore */
  }
}

export function clearRecent() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
