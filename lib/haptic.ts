/**
 * Tiny wrapper around the Vibration API. iOS Safari is still gating support
 * behind a flag at the time of writing, but Android Chrome / Edge / Firefox
 * all fire reliably. We always swallow errors so call sites can use this in
 * any handler without worrying about platform fallbacks.
 */
export function vibrate(pattern: number | number[] = 10) {
  if (typeof navigator === "undefined") return;
  if (typeof navigator.vibrate !== "function") return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* unsupported or disabled by user — silently noop */
  }
}
