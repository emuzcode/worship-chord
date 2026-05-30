type Size = "sm" | "md" | "lg";
type Theme = "light" | "dark";

const cache = new Map<string, string>();

function key(chord: string, size: Size, theme: Theme): string {
  return `${chord}|${size}|${theme}`;
}

export function getCachedDiagram(
  chord: string,
  size: Size,
  theme: Theme
): string | undefined {
  return cache.get(key(chord, size, theme));
}

export function setCachedDiagram(
  chord: string,
  size: Size,
  theme: Theme,
  html: string
) {
  cache.set(key(chord, size, theme), html);
}
