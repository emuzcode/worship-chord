"use client";

import { useMemo, useState } from "react";
import { ChordProParser, HtmlDivFormatter } from "chordsheetjs";
import type { Hymn } from "@/lib/types";
import { WakeLockButton } from "./WakeLockButton";

type Props = {
  hymn: Hymn;
};

export function HymnView({ hymn }: Props) {
  const [semitones, setSemitones] = useState(0);

  const { html, currentKey } = useMemo(() => {
    const parser = new ChordProParser();
    const song = parser.parse(hymn.chordpro);
    const transposed = semitones === 0 ? song : song.transpose(semitones);
    const formatter = new HtmlDivFormatter();
    return {
      html: formatter.format(transposed),
      currentKey:
        (transposed.metadata.get("key") as string | undefined) ?? hymn.metadata.key,
    };
  }, [hymn, semitones]);

  return (
    <article className="flex-1 flex flex-col w-full max-w-3xl mx-auto px-4 pb-32">
      <header className="pt-6 pb-4 border-b border-white/10">
        <h1 className="text-3xl font-bold tracking-tight">{hymn.metadata.title}</h1>
        {hymn.metadata.subtitle && (
          <p className="text-lg opacity-70 mt-1">{hymn.metadata.subtitle}</p>
        )}
        <p className="text-sm opacity-50 mt-2">
          {hymn.metadata.lyricist} / {hymn.metadata.composer} · {hymn.metadata.year}
        </p>
      </header>

      <div
        className="chord-sheet font-mono text-lg leading-loose pt-6 whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a]/95 backdrop-blur border-t border-white/10 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <WakeLockButton />
          <button
            type="button"
            onClick={() => setSemitones((s) => s - 1)}
            className="px-5 py-2 rounded-md border border-white/20 hover:bg-white/5 active:bg-white/10 transition-colors text-xl font-mono"
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
            className="px-5 py-2 rounded-md border border-white/20 hover:bg-white/5 active:bg-white/10 transition-colors text-xl font-mono"
            aria-label="Transpose up a semitone"
          >
            ＋
          </button>
        </div>
      </div>
    </article>
  );
}
