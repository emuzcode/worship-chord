import { notFound } from "next/navigation";
import Link from "next/link";
import { getHymn, getAllSlugs } from "@/lib/loadHymns";
import { HymnView } from "@/components/HymnView";

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function HymnPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const hymn = await getHymn(slug);
  if (!hymn) notFound();
  return (
    <>
      <nav className="w-full max-w-3xl mx-auto px-4 pt-4">
        <Link
          href="/"
          className="inline-block text-sm opacity-60 hover:opacity-100 transition-opacity"
        >
          ← back
        </Link>
      </nav>
      <HymnView hymn={hymn} />
    </>
  );
}
