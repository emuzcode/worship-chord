"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChordProParser, HtmlDivFormatter } from "chordsheetjs";
import type { Hymn } from "@/lib/types";
import { useWakeLock } from "@/lib/useWakeLock";
import { ThemeToggle } from "./ThemeToggle";
import { ChordPalette } from "./ChordPalette";
import { ChordPopup } from "./ChordPopup";
import { addRecent } from "@/lib/recent";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { toggleBookmark } from "@/lib/bookmarks";
import { vibrate } from "@/lib/haptic";
import { useStickyCompact } from "@/lib/useStickyCompact";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { navigateWithTransition } from "@/lib/viewTransition";

const HEADER_EXPANDED = 180;
const HEADER_COMPACT = 56;

type Props = {
  hymn: Hymn;
};

export function HymnView({ hymn }: Props) {
  // Keep the screen on while a hymn is being viewed.
  useWakeLock();

  const router = useRouter();
  const [semitones, setSemitones] = useState(0);
  const [popupChord, setPopupChord] = useState<string | null>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  // Hydrate semitones from the URL on mount so reload / share keeps transposition.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("t");
    if (!raw) return;
    const n = Number(raw);
    if (Number.isFinite(n) && n !== 0) setSemitones(n);
  }, []);

  // Remember this hymn in the recently-viewed list.
  useEffect(() => {
    if (hymn.metadata.x_slug) addRecent(hymn.metadata.x_slug);
  }, [hymn.metadata.x_slug]);

  const slug = hymn.metadata.x_slug;
  const bookmarked = useLiveQuery(
    async () => (slug ? Boolean(await db.bookmarks.get(slug)) : false),
    [slug],
    false
  );

  // Detail header collapses to a single-line title bar once the page has
  // scrolled past the sentinel. The current height is published as
  // --header-h so a sticky ChordPalette can sit flush against it.
  const { sentinelRef, compact } = useStickyCompact();
  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.style.setProperty(
      "--header-h",
      `${compact ? HEADER_COMPACT : HEADER_EXPANDED}px`
    );
    return () => {
      document.documentElement.style.removeProperty("--header-h");
    };
  }, [compact]);

  // Persist semitones into the URL whenever the user transposes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (semitones === 0) params.delete("t");
    else params.set("t", String(semitones));
    const qs = params.toString();
    const next = qs
      ? `${window.location.pathname}?${qs}`
      : window.location.pathname;
    if (next !== `${window.location.pathname}${window.location.search}`) {
      window.history.replaceState(null, "", next);
    }
  }, [semitones]);

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
      const onClick = () => {
        vibrate(8);
        setPopupChord(text);
      };
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
    <article className="flex-1 flex flex-col w-full max-w-3xl mx-auto px-4 pb-[calc(8rem+env(safe-area-inset-bottom))]">
      <div ref={sentinelRef} aria-hidden className="h-px" />
      <header
        className="sticky top-0 z-20 -mx-4 px-4 border-b border-foreground/10 bg-background/85 backdrop-blur-sm content-backdrop overflow-hidden transition-[max-height] duration-150 ease-out"
        style={{
          maxHeight: `${compact ? HEADER_COMPACT : HEADER_EXPANDED}px`,
        }}
      >
        <div className="pt-3 pb-2 flex items-start justify-between gap-2">
          <Link
            href="/"
            onClick={(e) => {
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
                return;
              }
              e.preventDefault();
              navigateWithTransition(() => router.push("/"));
            }}
            aria-label="Back to all hymns"
            className="text-foreground/50 hover:text-foreground/80 text-xl leading-none px-2 py-2 -ml-2 rounded-md transition-colors active:scale-95 flex-shrink-0"
          >
            ←
          </Link>
          <h1
            className={`font-bold tracking-tight font-serif flex-1 min-w-0 ${
              compact ? "text-xl truncate" : "text-3xl"
            }`}
            style={
              slug
                ? { viewTransitionName: `hymn-title-${slug}` }
                : undefined
            }
          >
            {hymn.metadata.title}
          </h1>
          <button
            type="button"
            onClick={() => {
              if (!slug) return;
              vibrate(12);
              toggleBookmark(slug);
            }}
            aria-pressed={bookmarked}
            aria-label={
              bookmarked ? "Remove from favorites" : "Add to favorites"
            }
            className={`text-2xl leading-none px-3 py-2 rounded-md transition-colors active:scale-95 ${
              bookmarked
                ? "text-accent"
                : "text-foreground/40 hover:text-foreground/70"
            }`}
          >
            {bookmarked ? "♥" : "♡"}
          </button>
        </div>
        <div className="pb-3 pr-12">
          {hymn.metadata.subtitle && (
            <p className="text-lg opacity-70">{hymn.metadata.subtitle}</p>
          )}
          <p className="text-sm opacity-50 mt-2">
            {hymn.metadata.lyricist} / {hymn.metadata.composer} ·{" "}
            {hymn.metadata.year}
          </p>
        </div>
      </header>

      <ChordPalette chords={uniqueChords} onSelect={setPopupChord} />

      <div
        ref={sheetRef}
        className="chord-sheet font-mono text-lg leading-loose pt-2 whitespace-pre-wrap content-backdrop"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <ChordPopup chord={popupChord} onClose={() => setPopupChord(null)} />

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-foreground/10 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-30">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => {
              vibrate(10);
              setSemitones((s) => s - 1);
            }}
            className="px-5 py-2 rounded-md border border-foreground/20 hover:bg-foreground/5 active:bg-foreground/10 active:scale-95 transition-all text-xl font-mono"
            aria-label="Transpose down a semitone"
          >
            −
          </button>
          <div className="flex flex-col items-center flex-1">
            <span
              key={currentKey}
              className="key-flip text-3xl font-mono font-bold tracking-tight"
            >
              {currentKey}
            </span>
            <span className="text-xs opacity-50 mt-0.5">
              {semitones > 0 ? `+${semitones}` : semitones} semi
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              vibrate(10);
              setSemitones((s) => s + 1);
            }}
            className="px-5 py-2 rounded-md border border-foreground/20 hover:bg-foreground/5 active:bg-foreground/10 active:scale-95 transition-all text-xl font-mono"
            aria-label="Transpose up a semitone"
          >
            ＋
          </button>
        </div>
      </div>
    </article>
  );
}
