import Dexie, { type EntityTable } from "dexie";
import type { Hymn } from "./types";

export type StoredHymn = Hymn & {
  id: string;
  createdAt: number;
  updatedAt: number;
};

const db = new Dexie("worship-chord") as Dexie & {
  hymns: EntityTable<StoredHymn, "id">;
};

db.version(1).stores({
  // primary key + index on updatedAt for sorting
  hymns: "id, updatedAt",
});

export { db };
