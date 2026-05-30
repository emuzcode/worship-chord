"use client";

import { useEffect } from "react";

export function SWRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker
      .register("/worship-chord/sw.js", { scope: "/worship-chord/" })
      .catch((err) => {
        console.warn("Service Worker registration failed:", err);
      });
  }, []);

  return null;
}
