"use client";

import { useEffect, useRef, useState } from "react";
import type { StoredHymn } from "@/lib/db";
import { saveMyHymn, deleteMyHymn } from "@/lib/myHymns";
import { ChordProHelp } from "./ChordProHelp";
import { vibrate } from "@/lib/haptic";

type Props = {
  hymn: StoredHymn;
  onDone: () => void;
  onCancel: () => void;
};

type Flash =
  | { kind: "saved" }
  | { kind: "error"; message: string }
  | null;

type Errors = { title?: string; chordpro?: string };

function Spinner() {
  return (
    <svg
      className="inline-block animate-spin h-3.5 w-3.5 align-[-2px] mr-1"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" opacity="0.25" />
      <path d="M21 12a9 9 0 0 0-9-9" strokeLinecap="round" />
    </svg>
  );
}

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
  const [flash, setFlash] = useState<Flash>(null);
  const [errors, setErrors] = useState<Errors>({});

  function validate(): boolean {
    const next: Errors = {};
    if (!title.trim()) next.title = "Title is required.";
    if (!chordpro.trim()) next.chordpro = "ChordPro body cannot be empty.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSave() {
    if (saving) return;
    if (!validate()) {
      vibrate([15, 40, 15]);
      return;
    }
    setSaving(true);
    try {
      const yearNum = Number.parseInt(year, 10);
      await saveMyHymn({
        ...hymn,
        metadata: {
          ...hymn.metadata,
          title: title.trim(),
          lyricist,
          composer,
          year: Number.isFinite(yearNum) ? yearNum : new Date().getFullYear(),
          key,
        },
        chordpro,
      });
      vibrate(15);
      setFlash({ kind: "saved" });
      // Keep the toast visible briefly before navigating back so the user
      // gets confirmation before the view changes.
      window.setTimeout(() => onDone(), 600);
    } catch (err) {
      console.error("HymnEditor save failed", err);
      setFlash({
        kind: "error",
        message: "Save failed. Check storage and try again.",
      });
      setSaving(false);
    }
  }

  async function handleDelete() {
    const ok = window.confirm(`Delete "${title}"? This cannot be undone.`);
    if (!ok) return;
    vibrate(20);
    await deleteMyHymn(hymn.id);
    onCancel();
  }

  // Cmd/Ctrl+S → save. We route through a ref so the latest closure is used
  // without re-binding the listener on every keystroke.
  const handleSaveRef = useRef(handleSave);
  handleSaveRef.current = handleSave;
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        handleSaveRef.current();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Auto-dismiss the success toast; error toasts stay until the next save.
  useEffect(() => {
    if (!flash || flash.kind !== "saved") return;
    const t = window.setTimeout(() => setFlash(null), 1500);
    return () => window.clearTimeout(t);
  }, [flash]);

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-6 pb-32">
      {flash && (
        <div
          role="status"
          aria-live="polite"
          className={`fade-up fixed top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-md text-sm border content-backdrop ${
            flash.kind === "saved"
              ? "border-accent/40 text-accent"
              : "border-red-500/40 text-red-400"
          }`}
        >
          {flash.kind === "saved" ? "Saved ✓" : flash.message}
        </div>
      )}

      <h1 className="text-2xl font-bold mb-4">Edit hymn</h1>
      <div className="grid gap-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm opacity-70">Title</span>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            aria-invalid={Boolean(errors.title)}
            className={`px-3 py-2 rounded-md border bg-transparent ${
              errors.title ? "border-red-500/60" : "border-foreground/20"
            }`}
          />
          {errors.title && (
            <span className="text-xs text-red-400">{errors.title}</span>
          )}
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
            ChordPro source{" "}
            <kbd className="ml-1 px-1.5 py-0.5 rounded border border-foreground/20 text-[10px] opacity-70">
              ⌘S
            </kbd>{" "}
            <span className="text-[10px] opacity-60">to save</span>
          </span>
          <textarea
            value={chordpro}
            onChange={(e) => setChordpro(e.target.value)}
            rows={16}
            aria-invalid={Boolean(errors.chordpro)}
            className={`px-3 py-2 rounded-md border bg-transparent font-mono text-sm whitespace-pre ${
              errors.chordpro ? "border-red-500/60" : "border-foreground/20"
            }`}
          />
          {errors.chordpro && (
            <span className="text-xs text-red-400">{errors.chordpro}</span>
          )}
        </label>
        <ChordProHelp />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-foreground/10 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-2 rounded-md border border-red-500/40 text-red-400 hover:bg-red-500/10 active:scale-95 transition-all text-sm"
          >
            Delete
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-md border border-foreground/20 hover:bg-foreground/5 active:scale-95 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 rounded-md border border-accent bg-accent/15 text-accent hover:bg-accent/25 active:scale-95 transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-wait"
            >
              {saving ? (
                <>
                  <Spinner />
                  Saving…
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
