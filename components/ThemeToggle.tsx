"use client";

import { useEffect, useState } from "react";
import { vibrate } from "@/lib/haptic";

const STORAGE_KEY = "worship-chord:theme";
type Theme = "dark" | "light";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
    const initial: Theme = stored ?? "dark";
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  function toggle() {
    vibrate(10);
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      className="px-4 py-2 rounded-md border border-foreground/20 hover:bg-foreground/5 active:bg-foreground/10 active:scale-95 transition-all text-xl"
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
