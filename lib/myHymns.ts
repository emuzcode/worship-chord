import { db, type StoredHymn } from "./db";

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `h-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function listMyHymns(): Promise<StoredHymn[]> {
  return db.hymns.orderBy("updatedAt").reverse().toArray();
}

export async function getMyHymn(id: string): Promise<StoredHymn | undefined> {
  return db.hymns.get(id);
}

export async function saveMyHymn(hymn: StoredHymn): Promise<void> {
  await db.hymns.put({ ...hymn, updatedAt: Date.now() });
}

export async function deleteMyHymn(id: string): Promise<void> {
  await db.hymns.delete(id);
}

export function makeNewHymn(): StoredHymn {
  const now = Date.now();
  const id = newId();
  return {
    id,
    metadata: {
      title: "Untitled",
      composer: "",
      lyricist: "",
      year: new Date().getFullYear(),
      key: "C",
      x_slug: id,
      x_pd_status: "user_added",
    },
    chordpro:
      "{title: Untitled}\n{key: C}\n\n{start_of_verse}\nWrite your [C]chord [G]sheet [Am]here.\n{end_of_verse}\n",
    createdAt: now,
    updatedAt: now,
  };
}
