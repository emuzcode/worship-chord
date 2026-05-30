import Link from "next/link";
import { getAllHymns } from "@/lib/loadHymns";

export default async function Home() {
  const hymns = await getAllHymns();
  return (
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">worship-chord</h1>
        <p className="text-sm opacity-60 mt-1">
          Public-domain hymns · {hymns.length} songs
        </p>
      </header>
      <ul className="space-y-3">
        {hymns.map((hymn) => (
          <li key={hymn.metadata.x_slug}>
            <Link
              href={`/${hymn.metadata.x_slug}`}
              className="block p-4 rounded-lg border border-white/10 hover:bg-white/5 active:bg-white/10 transition-colors"
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
