"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { listMyHymns } from "@/lib/myHymns";
import type { Hymn } from "@/lib/types";
import { CategoryFilter, type HymnCategory } from "./CategoryFilter";

const JP_CHAR = /[぀-ゟ゠-ヿ一-鿿]/;

function classifyHymn(h: Hymn): HymnCategory {
  if (h.metadata.x_pd_status === "user_added") return "my";
  if (JP_CHAR.test(h.metadata.title)) return "japanese";
  return "english";
}

function isValidCategory(v: string | null): v is HymnCategory {
  return v === "all" || v === "japanese" || v === "english" || v === "my";
}

type Props = {
  pdHymns: Hymn[];
};

function HymnListInner({ pdHymns }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFromUrl = searchParams.get("lang");
  const [category, setCategory] = useState<HymnCategory>(
    isValidCategory(initialFromUrl) ? initialFromUrl : "all"
  );

  // Keep state in sync if the URL changes via back/forward navigation.
  useEffect(() => {
    const fromUrl = searchParams.get("lang");
    if (isValidCategory(fromUrl) && fromUrl !== category) {
      setCategory(fromUrl);
    } else if (fromUrl === null && category !== "all") {
      setCategory("all");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const myHymns = useLiveQuery(() => listMyHymns(), []) ?? [];

  const combined: Hymn[] = useMemo(() => {
    const my: Hymn[] = myHymns.map((h) => ({
      metadata: h.metadata,
      chordpro: h.chordpro,
    }));
    return [...pdHymns, ...my];
  }, [pdHymns, myHymns]);

  const counts = useMemo<Record<HymnCategory, number>>(() => {
    const c = { all: combined.length, japanese: 0, english: 0, my: 0 };
    for (const h of combined) {
      const cat = classifyHymn(h);
      c[cat]++;
    }
    return c;
  }, [combined]);

  const visible: Hymn[] = useMemo(() => {
    if (category === "all") return combined;
    return combined.filter((h) => classifyHymn(h) === category);
  }, [combined, category]);

  function setFilter(next: HymnCategory) {
    setCategory(next);
    const params = new URLSearchParams(searchParams.toString());
    if (next === "all") params.delete("lang");
    else params.set("lang", next);
    const qs = params.toString();
    router.replace(qs ? `/?${qs}` : "/");
  }

  function detailHref(h: Hymn): string {
    return h.metadata.x_pd_status === "user_added"
      ? "/my"
      : `/${h.metadata.x_slug}`;
  }

  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8 flex items-baseline justify-between gap-4 content-backdrop">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-serif">
            worship-chord
          </h1>
          <p className="text-sm opacity-70 mt-1">
            Japanese hymns shared with the world.
          </p>
          <p className="text-xs opacity-50 mt-0.5">
            {counts.all} public-domain chord sheets · non-commercial
          </p>
        </div>
        <Link
          href="/my"
          className="text-sm opacity-70 hover:opacity-100 transition-opacity whitespace-nowrap"
        >
          My Songs →
        </Link>
      </header>

      <CategoryFilter value={category} counts={counts} onChange={setFilter} />

      {visible.length === 0 ? (
        <div className="opacity-60 text-center py-12 content-backdrop">
          <p>No hymns in this filter.</p>
          {category === "my" && (
            <p className="text-sm mt-2">
              <Link href="/my" className="underline">
                + Add a song on /my
              </Link>
            </p>
          )}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((h, i) => (
            <li
              key={`${h.metadata.x_slug}-${i}`}
              className="fade-up"
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <Link
                href={detailHref(h)}
                className="block p-4 rounded-lg border border-foreground/10 hover:bg-foreground/5 active:bg-foreground/10 transition-colors content-backdrop"
              >
                <h2 className="text-xl font-semibold font-serif">
                  {h.metadata.title}
                </h2>
                <p className="text-sm opacity-60 mt-1">
                  {h.metadata.lyricist || "—"} · {h.metadata.year} · key{" "}
                  {h.metadata.key}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export function HymnList(props: Props) {
  // useSearchParams requires Suspense for static export
  return (
    <Suspense
      fallback={
        <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8 opacity-60">
          Loading…
        </main>
      }
    >
      <HymnListInner {...props} />
    </Suspense>
  );
}
