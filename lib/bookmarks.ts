import { db, type Bookmark } from "./db";

export async function isBookmarked(slug: string): Promise<boolean> {
  if (!slug) return false;
  return Boolean(await db.bookmarks.get(slug));
}

export async function toggleBookmark(slug: string): Promise<boolean> {
  if (!slug) return false;
  const existing = await db.bookmarks.get(slug);
  if (existing) {
    await db.bookmarks.delete(slug);
    return false;
  }
  await db.bookmarks.put({ slug, addedAt: Date.now() });
  return true;
}

export async function listBookmarks(): Promise<Bookmark[]> {
  return db.bookmarks.orderBy("addedAt").reverse().toArray();
}
