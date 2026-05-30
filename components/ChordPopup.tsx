"use client";

import { useEffect } from "react";
import { ChordDiagram } from "./ChordDiagram";

type Props = {
  chord: string | null;
  onClose: () => void;
};

export function ChordPopup({ chord, onClose }: Props) {
  useEffect(() => {
    if (!chord) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [chord, onClose]);

  if (!chord) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${chord} chord diagram`}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="content-backdrop p-6 rounded-lg border border-foreground/20 max-w-[90vw]"
      >
        <ChordDiagram chord={chord} size="lg" />
        <button
          type="button"
          onClick={onClose}
          className="mt-4 w-full text-xs opacity-60 hover:opacity-100 transition-opacity"
          aria-label="Close chord diagram"
        >
          tap anywhere to close · esc
        </button>
      </div>
    </div>
  );
}
