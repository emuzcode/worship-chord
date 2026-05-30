import Dexie, { type EntityTable } from "dexie";
import type { Hymn } from "./types";

export type StoredHymn = Hymn & {
  id: string;
  createdAt: number;
  updatedAt: number;
};

export type Bookmark = {
  slug: string;
  addedAt: number;
};

const db = new Dexie("worship-chord") as Dexie & {
  hymns: EntityTable<StoredHymn, "id">;
  bookmarks: EntityTable<Bookmark, "slug">;
};

// v1: hymns only (user-added)
db.version(1).stores({
  hymns: "id, updatedAt",
});

// v2: added bookmarks (favorited slugs)
db.version(2).stores({
  hymns: "id, updatedAt",
  bookmarks: "slug, addedAt",
});

export { db };
