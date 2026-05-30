"use client";

import { memo, useEffect, useRef, useState } from "react";
import { SVGuitarChord } from "svguitar";
import { lookupChord } from "@/lib/chordLookup";
import {
  getCachedDiagram,
  setCachedDiagram,
} from "@/lib/chordDiagramCache";

type Size = "sm" | "md" | "lg";

const WIDTH: Record<Size, number> = { sm: 64, md: 104, lg: 200 };
const ASPECT = 1.3;

type Props = {
  chord: string;
  size?: Size;
  // Skip the IntersectionObserver gate and draw immediately. Used by the
  // chord popup which is mounted on demand and always wants a paint.
  eager?: boolean;
};

type IdleHandle = number;
type IdleGlobal = {
  requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => IdleHandle;
  cancelIdleCallback?: (handle: IdleHandle) => void;
};

function ChordDiagramImpl({ chord, size = "md", eager = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(eager);

  // Lazy entry: wait for the palette item to scroll near the viewport before
  // we spend cycles drawing it. Eager skips the gate.
  useEffect(() => {
    if (eager || visible) return;
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setVisible(true);
      return;
    }
    const obs = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [eager, visible]);

  useEffect(() => {
    if (!visible) return;
    const el = ref.current;
    if (!el) return;
    el.style.width = `${WIDTH[size]}px`;

    const cached = getCachedDiagram(chord, size);
    if (cached) {
      el.innerHTML = cached;
      return;
    }

    const pos = lookupChord(chord);
    if (!pos) {
      el.textContent = `${chord} (diagram unavailable)`;
      el.title = `${chord} — no fingering in the chord database`;
      return;
    }

    const fingers: Array<[number, number | "x"]> = [];
    pos.frets.forEach((fret, idx) => {
      const stringNum = 6 - idx;
      if (fret === -1) fingers.push([stringNum, "x"]);
      else fingers.push([stringNum, fret]);
    });

    const barres = (pos.barres ?? []).map((fret) => ({
      fromString: 6,
      toString: 1,
      fret,
    }));

    const draw = () => {
      try {
        el.innerHTML = "";
        const chart = new SVGuitarChord(el);
        chart
          .configure({
            strings: 6,
            frets: 5,
            title: chord,
            fingerSize: 0.65,
            fingerColor: "currentColor",
            fingerTextColor: "currentColor",
            stringColor: "currentColor",
            fretColor: "currentColor",
            fretLabelColor: "currentColor",
            tuningsColor: "currentColor",
            titleColor: "currentColor",
            backgroundColor: "transparent",
            position: pos.baseFret,
            fontFamily: "inherit",
          })
          .chord({ fingers, barres })
          .draw();
        setCachedDiagram(chord, size, el.innerHTML);
      } catch (err) {
        console.warn("ChordDiagram render failed for", chord, err);
        el.textContent = `${chord} (render error)`;
      }
    };

    // The large popup diagram is the most expensive paint; defer it to the
    // next idle slot so the popup transition stays smooth.
    if (size === "lg" && typeof window !== "undefined") {
      const g = window as unknown as IdleGlobal;
      if (g.requestIdleCallback) {
        const id = g.requestIdleCallback(draw, { timeout: 200 });
        return () => g.cancelIdleCallback?.(id);
      }
    }
    draw();
  }, [chord, size, visible]);

  return (
    <div
      ref={ref}
      className="inline-block text-foreground"
      style={{ minWidth: WIDTH[size], minHeight: Math.round(WIDTH[size] * ASPECT) }}
    />
  );
}

export const ChordDiagram = memo(ChordDiagramImpl);
