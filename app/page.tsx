import Link from "next/link";
import { getAllHymns } from "@/lib/loadHymns";

export default async function Home() {
  const hymns = await getAllHymns();
  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8 flex items-baseline justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">worship-chord</h1>
          <p className="text-sm opacity-70 mt-1">
            Japanese hymns shared with the world.
          </p>
          <p className="text-xs opacity-50 mt-0.5">
            {hymns.length} public-domain chord sheets · non-commercial
          </p>
        </div>
        <Link
          href="/my"
          className="text-sm opacity-70 hover:opacity-100 transition-opacity whitespace-nowrap"
        >
          My Songs →
        </Link>
      </header>
      <ul className="space-y-3">
        {hymns.map((hymn) => (
          <li key={hymn.metadata.x_slug}>
            <Link
              href={`/${hymn.metadata.x_slug}`}
              className="block p-4 rounded-lg border border-foreground/10 hover:bg-foreground/5 active:bg-foreground/10 transition-colors"
            >
              <h2 className="text-xl font-semibold">{hymn.metadata.title}</h2>
              <p className="text-sm opacity-60 mt-1">
                {hymn.metadata.lyricist} · {hymn.metadata.year} · key {hymn.metadata.key}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
