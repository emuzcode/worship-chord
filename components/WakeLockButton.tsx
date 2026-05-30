"use client";

import { useEffect, useState } from "react";

export function WakeLockButton() {
  const [active, setActive] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    setSupported("wakeLock" in navigator);
  }, []);

  useEffect(() => {
    if (!active) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    async function acquire() {
      try {
        sentinel = await navigator.wakeLock.request("screen");
        sentinel.addEventListener("release", () => {
          if (!cancelled) setActive(false);
        });
      } catch (err) {
        console.warn("Wake Lock request failed:", err);
        if (!cancelled) setActive(false);
      }
    }

    function handleVisibility() {
      if (document.visibilityState === "visible" && active && !sentinel) {
        acquire();
      }
    }

    acquire();
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", handleVisibility);
      sentinel?.release().catch(() => {});
    };
  }, [active]);

  if (!supported) return null;

  return (
    <button
      type="button"
      onClick={() => setActive((a) => !a)}
      aria-pressed={active}
      aria-label={active ? "Disable screen wake lock" : "Enable screen wake lock"}
      className={`px-4 py-2 rounded-md border transition-colors text-xl ${
        active
          ? "border-amber-400 bg-amber-400/10 text-amber-300"
          : "border-white/20 hover:bg-white/5"
      }`}
    >
      {active ? "☀" : "☾"}
    </button>
  );
}
