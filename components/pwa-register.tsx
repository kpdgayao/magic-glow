"use client";

import { useEffect, useState } from "react";
import { Download, X, Share } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent);
}

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator && (navigator as Record<string, unknown>).standalone === true)
  );
}

const DISMISS_KEY = "moneyglow_install_dismissed";

export function PWARegister() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    // Don't show if already installed
    if (isStandalone()) return;

    // Check if previously dismissed (within 7 days)
    const dismissedAt = localStorage.getItem(DISMISS_KEY);
    if (dismissedAt) {
      const daysSince =
        (Date.now() - parseInt(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    setDismissed(false);

    // Android/Desktop: capture beforeinstallprompt
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // iOS: show manual instructions
    if (isIOS()) {
      setShowIOSPrompt(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  }

  function handleDismiss() {
    setDismissed(true);
    setDeferredPrompt(null);
    setShowIOSPrompt(false);
    localStorage.setItem(DISMISS_KEY, Date.now().toString());
  }

  // Nothing to show
  if (dismissed || (!deferredPrompt && !showIOSPrompt)) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] mx-auto max-w-[480px] p-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
      <div className="flex items-center gap-3 rounded-xl border border-mg-pink/30 bg-card/95 backdrop-blur-md p-3 shadow-lg">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-mg-pink/10">
          {showIOSPrompt ? (
            <Share className="h-5 w-5 text-mg-pink" />
          ) : (
            <Download className="h-5 w-5 text-mg-pink" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">Install MoneyGlow</p>
          {showIOSPrompt ? (
            <p className="text-xs text-muted-foreground">
              Tap <Share className="inline h-3 w-3" /> then &quot;Add to Home
              Screen&quot;
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Add to your home screen for quick access
            </p>
          )}
        </div>
        {deferredPrompt && (
          <button
            onClick={handleInstall}
            className="shrink-0 rounded-lg bg-mg-pink px-3 py-1.5 text-xs font-semibold text-white"
          >
            Install
          </button>
        )}
        <button
          onClick={handleDismiss}
          className="shrink-0 p-1.5 text-muted-foreground hover:text-foreground min-h-[44px] min-w-[44px] flex items-center justify-center -mr-1.5"
          aria-label="Dismiss install prompt"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
