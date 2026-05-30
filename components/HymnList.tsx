"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { listMyHymns } from "@/lib/myHymns";
import type { Hymn } from "@/lib/types";
import { CategoryFilter, type HymnCategory } from "./CategoryFilter";
import { getRecent } from "@/lib/recent";
import { listBookmarks } from "@/lib/bookmarks";
import { navigateWithTransition } from "@/lib/viewTransition";
import { Footer } from "./Footer";
import { BrandMark } from "./BrandMark";

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

  // Recently-viewed slugs are read once on mount; the list is updated only when
  // a hymn detail page records it (no need to re-read on every interaction).
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  useEffect(() => {
    setRecentSlugs(getRecent());
  }, []);

  const bookmarkRows =
    useLiveQuery(() => listBookmarks(), [], [] as Awaited<ReturnType<typeof listBookmarks>>) ?? [];
  const bookmarkSlugs = useMemo(
    () => bookmarkRows.map((b) => b.slug),
    [bookmarkRows]
  );

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
    if (category !== "all") {
      return combined.filter((h) => classifyHymn(h) === category);
    }
    // In the All view, hymns already promoted into the Favorites or Recent
    // rows above are dropped from the main list so the same card isn't shown
    // two or three times. Language filters keep their full subset because
    // hiding entries there would silently shrink an already-narrow view.
    const shownAbove = new Set<string>();
    bookmarkSlugs.forEach((s) => shownAbove.add(s));
    recentSlugs.slice(0, 5).forEach((s) => shownAbove.add(s));
    return combined.filter((h) => !shownAbove.has(h.metadata.x_slug));
  }, [combined, category, bookmarkSlugs, recentSlugs]);

  // Map recent slugs to their hymn objects, preserving recent order.
  const recentHymns: Hymn[] = useMemo(() => {
    if (recentSlugs.length === 0) return [];
    const bySlug = new Map(combined.map((h) => [h.metadata.x_slug, h]));
    return recentSlugs
      .map((s) => bySlug.get(s))
      .filter((h): h is Hymn => h !== undefined)
      .slice(0, 5);
  }, [combined, recentSlugs]);

  const favoriteHymns: Hymn[] = useMemo(() => {
    if (bookmarkSlugs.length === 0) return [];
    const bySlug = new Map(combined.map((h) => [h.metadata.x_slug, h]));
    return bookmarkSlugs
      .map((s) => bySlug.get(s))
      .filter((h): h is Hymn => h !== undefined);
  }, [combined, bookmarkSlugs]);

  const PAGE_SIZE = 12;
  const [shown, setShown] = useState(PAGE_SIZE);

  // The mobile bottom quick-actions nav fights with the hero CTA on the
  // first viewport, so we only fade it in once the browse section has
  // actually intersected — i.e. the user has scrolled past the hero.
  const [showBottomNav, setShowBottomNav] = useState(false);
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") {
      setShowBottomNav(true);
      return;
    }
    const target = document.getElementById("hymn-browser");
    if (!target) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowBottomNav(entry.isIntersecting),
      // Shrink the viewport root by 120px from the bottom so the nav
      // only fades in after the user has actually scrolled into the
      // browse section, not when its top edge merely brushes the
      // viewport boundary while the hero is still in full view.
      { threshold: 0, rootMargin: "0px 0px -120px 0px" }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);
  // Tracks how many rows were shown before the most recent "Show more" so
  // that fade-up animationDelay only cascades over the newly revealed batch
  // instead of running across the entire list every time.
  const prevShownRef = useRef(0);

  function setFilter(next: HymnCategory) {
    setCategory(next);
    setShown(PAGE_SIZE);
    prevShownRef.current = 0;
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

  function scrollToBrowser() {
    if (typeof window === "undefined") return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    document.getElementById("hymn-browser")?.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  }

  return (
    <main className="flex-1 w-full">
      <section
        aria-labelledby="brand-heading"
        className="relative w-full min-h-screen min-h-[100dvh] flex flex-col px-4 text-center"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 3rem)" }}
      >
        <div className="flex-1 flex flex-col justify-center items-center">
          <h1 id="brand-heading" className="inline-block text-accent">
            <BrandMark className="mx-auto w-[240px] sm:w-[360px] h-auto" />
            <span className="sr-only">MIZMOR — worship-chord</span>
          </h1>
          <p
            lang="he"
            className="font-serif text-2xl opacity-55 mt-8 select-all"
            aria-hidden="true"
          >
            מִזְמוֹר
          </p>
          <p className="font-serif italic text-base opacity-70 mt-3 max-w-md">
            A song struck on strings.
          </p>
          <div className="mt-12 h-px w-16 bg-foreground/15" />
        </div>
        <button
          type="button"
          onClick={scrollToBrowser}
          aria-label="Browse the hymns"
          className="absolute left-1/2 -translate-x-1/2 text-[10px] tracking-[0.25em] uppercase font-mono opacity-40 hover:opacity-70 transition-opacity active:scale-95 px-3 py-2"
          style={{ bottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
        >
          ↓ Browse the hymns
        </button>
      </section>

      <div
        id="hymn-browser"
        className="w-full max-w-3xl mx-auto px-4 pb-[calc(7rem+env(safe-area-inset-bottom))] sm:pb-8 scroll-mt-4"
      >
        <div className="flex items-baseline justify-between mb-4">
          <p className="text-xs opacity-50 font-mono">
            {counts.all} hymns · public-domain · non-commercial
          </p>
          <Link
            href="/my"
            className="hidden sm:inline text-sm opacity-70 hover:opacity-100 transition-opacity"
          >
            My Songs →
          </Link>
        </div>

        <CategoryFilter value={category} counts={counts} onChange={setFilter} />

      {category === "all" && favoriteHymns.length > 0 && (
        <section aria-label="Favorites" className="mb-6">
          <h2 className="text-[10px] font-mono uppercase tracking-[0.15em] opacity-50 mb-2 text-accent">
            ♥ Favorites
          </h2>
          <ul className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory">
            {favoriteHymns.map((h) => (
              <li key={h.metadata.x_slug} className="snap-start flex-shrink-0">
                <Link
                  href={detailHref(h)}
                  className="block w-[180px] p-3 rounded-lg bg-accent/[0.06] hover:bg-accent/10 active:bg-accent/15 transition-colors"
                >
                  <h3 className="text-sm font-semibold font-serif truncate">
                    {h.metadata.title}
                  </h3>
                  <p className="text-[11px] opacity-60 mt-1 truncate">
                    key {h.metadata.key}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {category === "all" && recentHymns.length > 0 && (
        <section aria-label="Recently viewed" className="mb-6">
          <h2 className="text-[10px] font-mono uppercase tracking-[0.15em] opacity-50 mb-2">
            Recent
          </h2>
          <ul className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 snap-x snap-mandatory">
            {recentHymns.map((h) => (
              <li key={h.metadata.x_slug} className="snap-start flex-shrink-0">
                <Link
                  href={detailHref(h)}
                  className="block w-[180px] p-3 rounded-lg bg-foreground/[0.03] hover:bg-foreground/[0.06] active:bg-foreground/10 transition-colors"
                >
                  <h3 className="text-sm font-semibold font-serif truncate">
                    {h.metadata.title}
                  </h3>
                  <p className="text-[11px] opacity-60 mt-1 truncate">
                    key {h.metadata.key}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {visible.length === 0 ? (
        <div className="opacity-60 text-center py-12">
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
        <>
          <ul className="divide-y divide-foreground/5 sm:divide-y-0 sm:grid sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-3">
            {visible.slice(0, shown).map((h, i) => {
              const newRow = i >= prevShownRef.current;
              const delay = newRow ? (i - prevShownRef.current) * 40 : 0;
              return (
                <li
                  key={`${h.metadata.x_slug}-${i}`}
                  className={`sm:border-b sm:border-foreground/5 ${
                    newRow ? "fade-up" : ""
                  }`}
                  style={newRow ? { animationDelay: `${delay}ms` } : undefined}
                >
                  <Link
                    href={detailHref(h)}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
                        return;
                      }
                      e.preventDefault();
                      navigateWithTransition(() => router.push(detailHref(h)));
                    }}
                    className="flex items-baseline gap-3 px-2 py-2.5 rounded-md hover:bg-foreground/[0.04] active:bg-foreground/[0.07] transition-colors"
                  >
                    <h2
                      className="text-base font-semibold font-serif truncate flex-1 min-w-0"
                      style={{
                        viewTransitionName: `hymn-title-${h.metadata.x_slug}`,
                      }}
                    >
                      {h.metadata.title}
                    </h2>
                    <span className="text-[11px] opacity-50 font-mono whitespace-nowrap flex-shrink-0">
                      {h.metadata.year} · {h.metadata.key}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
          {shown < visible.length && (
            <button
              type="button"
              onClick={() => {
                prevShownRef.current = shown;
                setShown((s) => s + PAGE_SIZE);
              }}
              className="mt-8 mx-auto block px-6 py-2 rounded-md border border-foreground/15 text-[10px] tracking-[0.25em] uppercase font-mono opacity-60 hover:opacity-100 hover:border-foreground/30 active:scale-95 transition-all"
            >
              ↓ Show {Math.min(PAGE_SIZE, visible.length - shown)} more
            </button>
          )}
        </>
      )}

        <Footer />
      </div>

      <nav
        aria-label="Quick actions"
        aria-hidden={!showBottomNav}
        className={`fixed bottom-0 left-0 right-0 z-30 bg-background/95 backdrop-blur border-t border-foreground/10 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:hidden transition-opacity duration-200 ${
          showBottomNav ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-3">
          <span className="text-xs opacity-50 font-mono">
            {counts.all} hymns
          </span>
          <Link
            href="/my"
            className="px-4 py-2 rounded-md border border-foreground/20 text-foreground/80 hover:bg-foreground/5 active:bg-foreground/10 active:scale-95 transition-all text-sm"
          >
            My Songs →
          </Link>
        </div>
      </nav>
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
