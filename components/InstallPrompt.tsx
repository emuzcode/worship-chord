"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "worship-chord:install-dismissed";

type IOSNavigator = Navigator & { standalone?: boolean };

export function InstallPrompt() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as IOSNavigator).standalone === true;
    if (standalone) return;

    if (localStorage.getItem(STORAGE_KEY) === "1") return;

    const ua = window.navigator.userAgent;
    const isIOS = /iPhone|iPad|iPod/.test(ua);
    const isSafari = /Safari/.test(ua) && !/CriOS|FxiOS/.test(ua);
    if (!(isIOS && isSafari)) return;

    setShow(true);
  }, []);

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, "1");
    setShow(false);
  }

  if (!show) return null;

  return (
    <div className="fixed top-3 left-3 right-3 z-50 p-3 rounded-lg border border-amber-400/30 bg-[#0a0a0a]/90 backdrop-blur text-sm flex items-start gap-3 max-w-md mx-auto">
      <div className="flex-1">
        <p className="font-semibold mb-1">Install worship-chord</p>
        <p className="opacity-80">
          Tap{" "}
          <span className="font-mono inline-block px-1 rounded bg-white/10">
            ↑ Share
          </span>{" "}
          in Safari, then &ldquo;Add to Home Screen&rdquo;.
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install prompt"
        className="text-2xl opacity-60 hover:opacity-100 transition-opacity leading-none px-1"
      >
        ×
      </button>
    </div>
  );
}
