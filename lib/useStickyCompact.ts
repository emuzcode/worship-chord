"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Returns a `sentinelRef` to attach to a one-pixel div placed just above the
 * sticky header, plus a `compact` boolean that flips to true once the sentinel
 * leaves the viewport. Uses IntersectionObserver instead of a scroll listener
 * so the wake-locked detail page doesn't burn cycles on every frame.
 *
 * Place the sentinel like:
 *
 *   const { sentinelRef, compact } = useStickyCompact();
 *   return (
 *     <article>
 *       <div ref={sentinelRef} aria-hidden className="h-px" />
 *       <header>...</header>
 *       ...
 *     </article>
 *   );
 */
export function useStickyCompact() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setCompact(!entry.isIntersecting),
      { threshold: 0 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return { sentinelRef, compact };
}
