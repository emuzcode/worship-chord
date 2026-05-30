"use client";

import { useEffect } from "react";

/**
 * Global pointer-driven ripple effect.
 *
 * On every primary-button pointerdown the component spawns three hairline
 * concentric rings at the pointer location with a small stagger so the effect
 * reads as a water ripple. Each ring removes itself once its CSS animation
 * completes, so there is no DOM accumulation. Honors prefers-reduced-motion.
 */
export function RippleEffect() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const timeouts: number[] = [];

    function onPointerDown(e: PointerEvent) {
      if (e.button !== undefined && e.button !== 0) return;
      const target = e.target as Element | null;
      // Don't fire while typing in editable fields
      if (
        target &&
        (target.matches("input, textarea, select, [contenteditable='true']") ||
          target.closest("input, textarea, [contenteditable='true']"))
      ) {
        return;
      }
      const x = e.clientX;
      const y = e.clientY;
      for (let i = 0; i < 2; i++) {
        const t = window.setTimeout(() => spawn(x, y), i * 220);
        timeouts.push(t);
      }
    }

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      timeouts.forEach((t) => clearTimeout(t));
    };
  }, []);

  return null;
}

function spawn(x: number, y: number) {
  const ring = document.createElement("span");
  ring.className = "ripple";
  ring.style.left = `${x}px`;
  ring.style.top = `${y}px`;
  document.body.appendChild(ring);
  window.setTimeout(() => ring.remove(), 1600);
}
