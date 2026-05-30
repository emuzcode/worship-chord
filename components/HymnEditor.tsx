"use client";

import { useState } from "react";
import type { StoredHymn } from "@/lib/db";
import { saveMyHymn, deleteMyHymn } from "@/lib/myHymns";

type Props = {
  hymn: StoredHymn;
  onDone: () => void;
  onCancel: () => void;
};

export function HymnEditor({ hymn, onDone, onCancel }: Props) {
  const [title, setTitle] = useState(hymn.metadata.title);
  const [lyricist, setLyricist] = useState(hymn.metadata.lyricist ?? "");
  const [composer, setComposer] = useState(hymn.metadata.composer ?? "");
  const [year, setYear] = useState(
    String(hymn.metadata.year ?? new Date().getFullYear())
  );
  const [key, setKey] = useState(hymn.metadata.key);
  const [chordpro, setChordpro] = useState(hymn.chordpro);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const yearNum = Number.parseInt(year, 10);
    await saveMyHymn({
      ...hymn,
      metadata: {
        ...hymn.metadata,
        title: title.trim() || "Untitled",
        lyricist,
        composer,
        year: Number.isFinite(yearNum) ? yearNum : new Date().getFullYear(),
        key,
      },
      chordpro,
    });
    onDone();
  }

  async function handleDelete() {
    const ok = window.confirm(`Delete "${title}"? This cannot be undone.`);
    if (!ok) return;
    await deleteMyHymn(hymn.id);
    onCancel();
  }

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 pb-32">
      <h1 className="text-2xl font-bold mb-4">Edit hymn</h1>
      <div className="grid gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm opacity-70">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 rounded-md border border-foreground/20 bg-transparent"
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-70">Lyricist</span>
            <input
              value={lyricist}
              onChange={(e) => setLyricist(e.target.value)}
              className="px-3 py-2 rounded-md border border-foreground/20 bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-70">Composer</span>
            <input
              value={composer}
              onChange={(e) => setComposer(e.target.value)}
              className="px-3 py-2 rounded-md border border-foreground/20 bg-transparent"
            />
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-70">Year</span>
            <input
              value={year}
              onChange={(e) => setYear(e.target.value)}
              inputMode="numeric"
              className="px-3 py-2 rounded-md border border-foreground/20 bg-transparent"
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-sm opacity-70">Initial key</span>
            <input
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="px-3 py-2 rounded-md border border-foreground/20 bg-transparent"
            />
          </label>
        </div>
        <label className="flex flex-col gap-1">
          <span className="text-sm opacity-70">
            ChordPro source
            <span className="opacity-50">
              {" "}— use [C] inline before lyrics, {"{key:}"}, {"{start_of_verse}"} etc.
            </span>
          </span>
          <textarea
            value={chordpro}
            onChange={(e) => setChordpro(e.target.value)}
            rows={16}
            className="px-3 py-2 rounded-md border border-foreground/20 bg-transparent font-mono text-sm whitespace-pre"
          />
        </label>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-foreground/10 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 rounded-md border border-red-500/40 text-red-400 hover:bg-red-500/10 transition-colors text-sm"
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-md border border-foreground/20 hover:bg-foreground/5 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-md border border-amber-400 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25 transition-colors text-sm font-semibold disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
