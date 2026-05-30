"use client";

import { useEffect } from "react";

/**
 * Acquire a screen wake lock for as long as the component is mounted.
 * Re-acquires automatically when the tab becomes visible again
 * (browsers release the lock when the tab is hidden).
 * No-op on browsers without Wake Lock API support.
 */
export function useWakeLock() {
  useEffect(() => {
    if (!("wakeLock" in navigator)) return;

    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    async function acquire() {
      if (cancelled) return;
      try {
        sentinel = await navigator.wakeLock.request("screen");
      } catch (err) {
        console.warn("Wake Lock request failed:", err);
      }
    }

    function handleVisibility() {
      if (document.visibilityState === "visible" && !sentinel) {
        acquire();
      }
    }

    acquire();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      sentinel?.release().catch(() => {});
      sentinel = null;
    };
  }, []);
}
