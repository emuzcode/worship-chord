import { getAllHymns } from "@/lib/loadHymns";
import { HymnList } from "@/components/HymnList";

export default async function Home() {
  const hymns = await getAllHymns();
  return <HymnList pdHymns={hymns} />;
}
