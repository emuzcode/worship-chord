import { notFound } from "next/navigation";
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
  return <HymnView hymn={hymn} />;
}
