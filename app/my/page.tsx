"use client";

import { useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { listMyHymns, makeNewHymn, saveMyHymn } from "@/lib/myHymns";
import { HymnView } from "@/components/HymnView";
import { HymnEditor } from "@/components/HymnEditor";

type ViewMode = "list" | "view" | "edit";

export default function MyPage() {
  const hymns = useLiveQuery(() => listMyHymns()) ?? [];
  const [view, setView] = useState<ViewMode>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = hymns.find((h) => h.id === selectedId);

  async function startNew() {
    const next = makeNewHymn();
    await saveMyHymn(next);
    setSelectedId(next.id);
    setView("edit");
  }

  if (view === "edit" && selected) {
    return (
      <HymnEditor
        hymn={selected}
        onDone={() => setView("view")}
        onCancel={() => {
          setSelectedId(null);
          setView("list");
        }}
      />
    );
  }

  if (view === "view" && selected) {
    return (
      <>
        <nav className="w-full max-w-3xl mx-auto px-4 pt-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              setSelectedId(null);
              setView("list");
            }}
            className="text-sm opacity-60 hover:opacity-100 transition-opacity"
          >
            ← My Songs
          </button>
          <button
            type="button"
            onClick={() => setView("edit")}
            className="px-3 py-1 rounded-md border border-foreground/20 hover:bg-foreground/5 active:bg-foreground/10 transition-colors text-sm"
          >
            Edit
          </button>
        </nav>
        <HymnView hymn={selected} />
      </>
    );
  }

  // list view
  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
      <header className="mb-6 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Songs</h1>
          <p className="text-sm opacity-60 mt-1">
            {hymns.length} {hymns.length === 1 ? "song" : "songs"} · stored in your
            browser
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="px-4 py-2 rounded-md border border-amber-400 bg-amber-400/15 text-amber-300 hover:bg-amber-400/25 transition-colors text-sm font-semibold whitespace-nowrap"
        >
          + Add
        </button>
      </header>

      {hymns.length === 0 ? (
        <div className="opacity-60 text-center py-12">
          <p>No songs yet.</p>
          <p className="text-sm mt-2">
            Tap <span className="font-mono">+ Add</span> to write your first hymn in
            ChordPro.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {hymns.map((h) => (
            <li key={h.id}>
              <button
                type="button"
                onClick={() => {
                  setSelectedId(h.id);
                  setView("view");
                }}
                className="w-full text-left p-4 rounded-lg border border-foreground/10 hover:bg-foreground/5 active:bg-foreground/10 transition-colors"
              >
                <h2 className="text-xl font-semibold">{h.metadata.title}</h2>
                <p className="text-sm opacity-60 mt-1">
                  {h.metadata.lyricist || "—"} · key {h.metadata.key}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-12 text-center">
        <Link
          href="/"
          className="text-sm opacity-60 hover:opacity-100 transition-opacity"
        >
          ← Back to public-domain hymns
        </Link>
      </p>
    </main>
  );
}
