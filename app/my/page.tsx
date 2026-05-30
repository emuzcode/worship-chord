"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "@/lib/db";
import { listMyHymns, makeNewHymn, saveMyHymn } from "@/lib/myHymns";
import { HymnView } from "@/components/HymnView";
import { HymnEditor } from "@/components/HymnEditor";
import { ChordProHelp } from "@/components/ChordProHelp";

type ViewMode = "list" | "view" | "edit";

export default function MyPage() {
  const hymns = useLiveQuery(() => listMyHymns()) ?? [];
  const [view, setView] = useState<ViewMode>("list");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Probe IndexedDB once at mount. Private-mode Safari and certain
  // enterprise policies disable it, and we want to surface that as a
  // clear error rather than silently dropping the user's writes.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (typeof indexedDB === "undefined") {
          throw new Error("IndexedDB is unavailable in this browser.");
        }
        await db.hymns.count();
      } catch (err) {
        if (cancelled) return;
        console.warn("MyPage storage probe failed", err);
        setStorageError(
          "This browser is blocking local storage (private mode or quota disabled). My Songs need IndexedDB to save."
        );
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const selected = hymns.find((h) => h.id === selectedId);

  async function startNew() {
    try {
      const next = makeNewHymn();
      await saveMyHymn(next);
      setSelectedId(next.id);
      setView("edit");
    } catch (err) {
      console.error("startNew failed", err);
      setStorageError(
        "Could not create a new hymn. Local storage may be full or disabled."
      );
    }
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
      <header className="mb-4 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Songs</h1>
          <p className="text-sm opacity-60 mt-1">
            {hymns.length} {hymns.length === 1 ? "song" : "songs"}
          </p>
        </div>
        <button
          type="button"
          onClick={startNew}
          className="px-4 py-2 rounded-md border border-accent bg-accent/15 text-accent hover:bg-accent/25 active:scale-95 transition-all text-sm font-semibold whitespace-nowrap"
        >
          + Add
        </button>
      </header>

      {storageError && (
        <div
          role="alert"
          className="rounded-lg border border-red-500/40 bg-red-500/10 px-4 py-3 mb-4 text-sm text-red-300"
        >
          <p className="font-semibold">Local storage unavailable</p>
          <p className="opacity-80 mt-1">{storageError}</p>
        </div>
      )}

      <div className="rounded-lg border border-foreground/10 bg-foreground/5 px-4 py-3 mb-4 text-sm">
        <p className="font-semibold">Stays on this device.</p>
        <p className="opacity-70 mt-1">
          Songs you add here are saved in your browser&rsquo;s IndexedDB. They are
          never uploaded, shared, or included in the public repository.
        </p>
      </div>

      <ChordProHelp />

      {hymns.length === 0 ? (
        <div className="opacity-60 text-center py-12">
          <p>No songs yet.</p>
          <p className="text-sm mt-2">
            Tap <span className="font-mono">+ Add</span> to write your first hymn.
            <br />
            Open <span className="font-mono">How to write ChordPro</span> above for
            a quick syntax tour.
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
