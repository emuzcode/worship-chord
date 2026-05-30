type Size = "sm" | "md" | "lg";

const cache = new Map<string, string>();

function key(chord: string, size: Size): string {
  return `${chord}|${size}`;
}

export function getCachedDiagram(chord: string, size: Size): string | undefined {
  return cache.get(key(chord, size));
}

export function setCachedDiagram(chord: string, size: Size, html: string) {
  cache.set(key(chord, size), html);
}
