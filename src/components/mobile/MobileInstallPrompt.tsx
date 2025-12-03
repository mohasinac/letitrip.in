"use client";

import { useState, useEffect } from "react";
import { X, Download, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function MobileInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    // Check if already installed (standalone mode)
    const isInStandaloneMode =
      globalThis.matchMedia?.("(display-mode: standalone)").matches ||
      (globalThis.navigator as any)?.standalone === true;
    setIsStandalone(isInStandaloneMode);

    // Check if iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Check if prompt was dismissed recently
    const dismissedAt = localStorage.getItem("pwaPromptDismissed");
    if (dismissedAt) {
      const dismissedTime = parseInt(dismissedAt, 10);
      const daysSinceDismissed =
        (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24);
      if (daysSinceDismissed < 7) {
        return;
      }
    }

    // Listen for beforeinstallprompt event (Chrome/Edge/etc)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show prompt after a delay for better UX
      setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
    };

    globalThis.addEventListener?.(
      "beforeinstallprompt",
      handleBeforeInstallPrompt,
    );

    // For iOS, show custom prompt after delay if not installed
    if (ios && !isInStandaloneMode) {
      setTimeout(() => {
        setShowPrompt(true);
      }, 5000);
    }

    return () => {
      globalThis.removeEventListener?.(
        "beforeinstallprompt",
        handleBeforeInstallPrompt,
      );
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setShowPrompt(false);
      }
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwaPromptDismissed", Date.now().toString());
  };

  // Don't show if already installed or no prompt available
  if (isStandalone || !showPrompt) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-20 left-4 right-4 z-50 lg:hidden",
        "bg-white rounded-xl shadow-xl border border-gray-200",
        "animate-slide-up",
        "safe-area-inset-bottom",
      )}
      role="dialog"
      aria-labelledby="install-prompt-title"
    >
      <div className="p-4">
        {/* Close button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 touch-target"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="flex items-start gap-3 pr-6">
          {/* App Icon */}
          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold text-lg">LR</span>
          </div>

          <div className="flex-1">
            <h3
              id="install-prompt-title"
              className="font-semibold text-gray-900 text-sm"
            >
              Install Let It Rip
            </h3>
            <p className="text-xs text-gray-600 mt-0.5">
              Add to home screen for faster access
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4">
          {isIOS ? (
            // iOS instructions
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-700 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                <span>
                  Tap <span className="font-medium">Share</span> then{" "}
                  <span className="font-medium">"Add to Home Screen"</span>
                </span>
              </p>
            </div>
          ) : (
            // Android/Chrome install button
            <div className="flex gap-2">
              <button
                onClick={handleDismiss}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg touch-target"
              >
                Not now
              </button>
              <button
                onClick={handleInstall}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg flex items-center justify-center gap-2 touch-target"
              >
                <Download className="w-4 h-4" />
                Install
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
