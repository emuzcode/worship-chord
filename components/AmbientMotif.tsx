"use client";

import { useEffect, useRef } from "react";
import {
  MOTIFS,
  MOTIF_POOL,
  pickEdgePosition,
  rand,
  pick,
} from "@/lib/motifs";

/**
 * Ambient hairline motif backdrop — JS-driven spawn loop.
 *
 * Renders into a fixed <svg> beneath all content. Periodically inserts
 * a randomized motif group at an edge-zone position, animates it via
 * CSS (`draw-fade-spawn`), and removes it after the life cycle ends.
 *
 * Respects `prefers-reduced-motion` (does not spawn when reduce is set).
 */
export function AmbientMotif() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svgEl = svgRef.current;
    if (!svgEl) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let viewportW = window.innerWidth;
    let viewportH = window.innerHeight;
    svgEl.setAttribute("viewBox", `0 0 ${viewportW} ${viewportH}`);

    // Concurrent active-motif cap scales with viewport area. iPhone SE
    // (~250k px²) gets ~5 active, FHD (~2M px²) gets ~28. Prevents motif
    // overload on phones while letting desktop breathe.
    let maxActive = Math.max(
      5,
      Math.min(28, Math.round((viewportW * viewportH) / 55000))
    );

    const cleanups: Array<() => void> = [];

    const updateViewBox = () => {
      viewportW = window.innerWidth;
      viewportH = window.innerHeight;
      svgEl.setAttribute("viewBox", `0 0 ${viewportW} ${viewportH}`);
      maxActive = Math.max(
        5,
        Math.min(28, Math.round((viewportW * viewportH) / 55000))
      );
    };

    const resizeObserver = new ResizeObserver(() => updateViewBox());
    resizeObserver.observe(document.documentElement);
    cleanups.push(() => resizeObserver.disconnect());

    const spawn = () => {
      // Source of truth for active count is the live DOM rather than a
      // counter — removeTimer is guaranteed to detach each <g>, so
      // querying avoids any drift between intended and actual state.
      if (svgEl.querySelectorAll(".spawned-group").length >= maxActive) {
        return;
      }
      const name = pick(MOTIF_POOL);
      const motifFn = MOTIFS[name];
      if (!motifFn) return;

      const g = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "g"
      ) as SVGGElement;
      g.setAttribute("class", "spawned-group");

      const [tx, ty] = pickEdgePosition(viewportW, viewportH);
      const rot = rand(-30, 30);
      g.setAttribute("transform", `translate(${tx} ${ty}) rotate(${rot})`);
      svgEl.appendChild(g);

      const approxLen = Math.max(100, Math.ceil(motifFn(g)));
      const life = rand(7, 11);
      g.style.setProperty("--dash", String(approxLen));
      g.style.setProperty("--life", `${life}s`);

      const removeTimer = window.setTimeout(() => {
        g.remove();
      }, life * 1000 + 200);
      cleanups.push(() => clearTimeout(removeTimer));
    };

    const tick = () => {
      if (!document.hidden) {
        spawn();
        if (Math.random() < 0.7) spawn();
      }
      const next = rand(700, 1700);
      const t = window.setTimeout(tick, next);
      cleanups.push(() => clearTimeout(t));
    };

    const initialDelay = window.setTimeout(tick, rand(400, 1500));
    cleanups.push(() => clearTimeout(initialDelay));

    return () => {
      for (const c of cleanups) c();
      while (svgEl.firstChild) svgEl.removeChild(svgEl.firstChild);
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      className="ambient-motif"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    />
  );
}
