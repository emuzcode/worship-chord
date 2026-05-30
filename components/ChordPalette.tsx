"use client";

import { ChordDiagram } from "./ChordDiagram";
import { vibrate } from "@/lib/haptic";

type Props = {
  chords: string[];
  onSelect?: (chord: string) => void;
};

export function ChordPalette({ chords, onSelect }: Props) {
  if (chords.length === 0) return null;
  return (
    <div
      className="sticky z-10 -mx-4 px-2 py-2 my-2 flex gap-2 overflow-x-auto snap-x snap-mandatory bg-background/85 backdrop-blur-sm border-b border-foreground/10 transition-[top] duration-150 ease-out"
      style={{ top: "var(--header-h, 0px)" }}
    >
      {chords.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => {
            vibrate(8);
            onSelect?.(c);
          }}
          aria-label={`Show ${c} chord diagram`}
          className="snap-start flex-shrink-0 p-1 rounded hover:bg-foreground/5 active:bg-foreground/10 active:scale-95 transition-all"
        >
          <ChordDiagram chord={c} size="sm" />
        </button>
      ))}
    </div>
  );
}
