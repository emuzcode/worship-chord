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
    <div className="flex flex-wrap gap-2 my-4 content-backdrop p-3 rounded-lg border border-foreground/10">
      {chords.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => {
            vibrate(8);
            onSelect?.(c);
          }}
          aria-label={`Show ${c} chord diagram`}
          className="p-1 rounded hover:bg-foreground/5 active:bg-foreground/10 active:scale-95 transition-all"
        >
          <ChordDiagram chord={c} size="sm" />
        </button>
      ))}
    </div>
  );
}
