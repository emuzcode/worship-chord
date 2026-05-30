"use client";

import { useEffect, useState } from "react";

export type ThemeKey = "light" | "dark";

/**
 * Reads the current theme from the <html> class list and re-renders the
 * caller whenever the theme is toggled. Used by chord-diagram rendering so
 * cached SVGs stay tied to the theme that drew them — SVGuitar bakes the
 * resolved currentColor into the output, so a single cache key per chord
 * isn't enough.
 */
export function useThemeKey(): ThemeKey {
  const [theme, setTheme] = useState<ThemeKey>("dark");

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const read = () =>
      setTheme(root.classList.contains("dark") ? "dark" : "light");
    read();
    const obs = new MutationObserver(read);
    obs.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  return theme;
}
