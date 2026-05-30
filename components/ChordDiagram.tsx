"use client";

import { useEffect, useRef } from "react";
import { SVGuitarChord } from "svguitar";
import { lookupChord } from "@/lib/chordLookup";

type Size = "sm" | "md" | "lg";

const WIDTH: Record<Size, number> = { sm: 64, md: 104, lg: 200 };

type Props = {
  chord: string;
  size?: Size;
};

/**
 * Renders a guitar chord diagram via SVGuitar.
 * Falls back to plain text if the chord isn't in the database.
 */
export function ChordDiagram({ chord, size = "md" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.innerHTML = "";

    const pos = lookupChord(chord);
    if (!pos) {
      el.textContent = `${chord} (?)`;
      return;
    }

    // chords-db lays out fingers from low-E (string 6) to high-E (string 1).
    // SVGuitar wants the opposite numbering: string 1 == high E.
    const fingers: Array<[number, number | "x"]> = [];
    pos.frets.forEach((fret, idx) => {
      const stringNum = 6 - idx;
      if (fret === -1) {
        fingers.push([stringNum, "x"]);
      } else {
        fingers.push([stringNum, fret]);
      }
    });

    const barres = (pos.barres ?? []).map((fret) => ({
      fromString: 6,
      toString: 1,
      fret,
    }));

    try {
      el.style.width = `${WIDTH[size]}px`;
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
    } catch (err) {
      console.warn("ChordDiagram render failed for", chord, err);
      el.textContent = chord;
    }
  }, [chord, size]);

  return <div ref={ref} className="inline-block text-foreground" />;
}
