"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChordProParser, HtmlDivFormatter } from "chordsheetjs";
import type { Hymn } from "@/lib/types";
import { useWakeLock } from "@/lib/useWakeLock";
import { ThemeToggle } from "./ThemeToggle";
import { ChordPalette } from "./ChordPalette";
import { ChordPopup } from "./ChordPopup";

type Props = {
  hymn: Hymn;
};

export function HymnView({ hymn }: Props) {
  // Keep the screen on while a hymn is being viewed.
  useWakeLock();

  const [semitones, setSemitones] = useState(0);
  const [popupChord, setPopupChord] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  const { html, currentKey, uniqueChords } = useMemo(() => {
    const parser = new ChordProParser();
    const song = parser.parse(hymn.chordpro);
    const transposed = semitones === 0 ? song : song.transpose(semitones);
    const formatter = new HtmlDivFormatter();
    const renderedHtml = formatter.format(transposed);

    // Extract unique chords from the rendered HTML so the palette reflects the
    // current transposition. We pick from the actual `.chord` elements rather
    // than the source chordpro because ChordSheetJS may normalize sharps/flats.
    const tmp = typeof window !== "undefined" ? document.createElement("div") : null;
    const set = new Set<string>();
    if (tmp) {
      tmp.innerHTML = renderedHtml;
      tmp.querySelectorAll(".chord").forEach((el) => {
        const t = el.textContent?.trim();
        if (t) set.add(t);
      });
    }

    return {
      html: renderedHtml,
      currentKey:
        (transposed.metadata.get("key") as string | undefined) ?? hymn.metadata.key,
      uniqueChords: Array.from(set),
    };
  }, [hymn, semitones]);

  // Attach click handlers to each chord in the rendered chord-sheet so tapping
  // opens the chord-diagram popup.
  useEffect(() => {
    const root = sheetRef.current;
    if (!root) return;
    const chordEls = root.querySelectorAll<HTMLElement>(".chord");
    const cleanups: Array<() => void> = [];
    chordEls.forEach((el) => {
      const text = el.textContent?.trim();
      if (!text) return;
      el.style.cursor = "pointer";
      el.setAttribute("role", "button");
      el.setAttribute("tabindex", "0");
      const onClick = () => setPopupChord(text);
      const onKey = (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          setPopupChord(text);
        }
      };
      el.addEventListener("click", onClick);
      el.addEventListener("keydown", onKey);
      cleanups.push(() => {
        el.removeEventListener("click", onClick);
        el.removeEventListener("keydown", onKey);
      });
    });
    return () => cleanups.forEach((c) => c());
  }, [html]);

  return (
    <article className="flex-1 flex flex-col w-full max-w-3xl mx-auto px-4 pb-32">
      <header className="pt-6 pb-4 border-b border-foreground/10 content-backdrop">
        <h1 className="text-3xl font-bold tracking-tight font-serif">
          {hymn.metadata.title}
        </h1>
        {hymn.metadata.subtitle && (
          <p className="text-lg opacity-70 mt-1">{hymn.metadata.subtitle}</p>
        )}
        <p className="text-sm opacity-50 mt-2">
          {hymn.metadata.lyricist} / {hymn.metadata.composer} · {hymn.metadata.year}
        </p>
      </header>

      <ChordPalette chords={uniqueChords} onSelect={setPopupChord} />

      <div
        ref={sheetRef}
        className="chord-sheet font-mono text-lg leading-loose pt-2 whitespace-pre-wrap content-backdrop"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <ChordPopup chord={popupChord} onClose={() => setPopupChord(null)} />

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-foreground/10 px-4 py-3 z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setSemitones((s) => s - 1)}
            className="px-5 py-2 rounded-md border border-foreground/20 hover:bg-foreground/5 active:bg-foreground/10 transition-colors text-xl font-mono"
            aria-label="Transpose down a semitone"
          >
            −
          </button>
          <div className="flex flex-col items-center flex-1">
            <span className="text-3xl font-mono font-bold tracking-tight">
              {currentKey}
            </span>
            <span className="text-xs opacity-50 mt-0.5">
              {semitones > 0 ? `+${semitones}` : semitones} semi
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSemitones((s) => s + 1)}
            className="px-5 py-2 rounded-md border border-foreground/20 hover:bg-foreground/5 active:bg-foreground/10 transition-colors text-xl font-mono"
            aria-label="Transpose up a semitone"
          >
            ＋
          </button>
        </div>
      </div>
    </article>
  );
}
