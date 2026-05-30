import fs from "node:fs/promises";
import path from "node:path";
import type { Hymn } from "./types";

const HYMNS_DIR = path.join(process.cwd(), "public", "data", "hymns");

export async function getAllHymns(): Promise<Hymn[]> {
  const files = await fs.readdir(HYMNS_DIR);
  const jsonFiles = files.filter((f) => f.endsWith(".json"));
  const hymns = await Promise.all(
    jsonFiles.map(async (file) => {
      const content = await fs.readFile(path.join(HYMNS_DIR, file), "utf-8");
      return JSON.parse(content) as Hymn;
    })
  );
  return hymns.sort((a, b) => a.metadata.title.localeCompare(b.metadata.title));
}

export async function getHymn(slug: string): Promise<Hymn | null> {
  try {
    const content = await fs.readFile(
      path.join(HYMNS_DIR, `${slug}.json`),
      "utf-8"
    );
    return JSON.parse(content) as Hymn;
  } catch {
    return null;
  }
}

export async function getAllSlugs(): Promise<string[]> {
  const files = await fs.readdir(HYMNS_DIR);
  return files.filter((f) => f.endsWith(".json")).map((f) => f.replace(".json", ""));
}
