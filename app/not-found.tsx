import Link from "next/link";
import { Footer } from "@/components/Footer";
import { BrandMark } from "@/components/BrandMark";

export default function NotFound() {
  return (
    <>
      <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-20 flex flex-col items-center text-center content-backdrop">
        <BrandMark
          size={56}
          className="text-accent/80"
        />
        <h1 className="text-2xl font-bold tracking-tight font-serif mt-8">
          Hymn not found
        </h1>
        <p className="text-sm opacity-60 mt-3 max-w-md">
          The page you looked for isn&apos;t here. The hymn may have moved or
          the link may be stale.
        </p>
        <Link
          href="/"
          className="mt-8 px-5 py-2 rounded-md border border-accent text-accent bg-accent/10 hover:bg-accent/20 active:scale-95 transition-all text-sm font-semibold"
        >
          ← Back to all hymns
        </Link>
      </main>
      <Footer />
    </>
  );
}
