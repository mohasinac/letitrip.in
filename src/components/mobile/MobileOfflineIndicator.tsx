/**
 * @fileoverview React Component
 * @module src/components/mobile/MobileOfflineIndicator
 * @description This file contains the MobileOfflineIndicator component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Function: Mobile Offline Indicator
 */
/**
 * Performs mobile offline indicator operation
 *
 * @returns {any} The mobileofflineindicator result
 *
 * @example
 * MobileOfflineIndicator();
 */

/**
 * Performs mobile offline indicator operation
 *
 * @returns {any} The mobileofflineindicator result
 *
 * @example
 * MobileOfflineIndicator();
 */

export function MobileOfflineIndicator() {
  const [isOffline, setIsOffline] = useState(false);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    // Check initial state
    setIsOffline(!navigator.onLine);

    /**
     * Handles online event
     *
     * @returns {any} The handleonline result
     */

    /**
     * Handles online event
     *
     * @returns {any} The handleonline result
     */

    const handleOnline = () => {
      setIsOffline(false);
      // Show "Back online" briefly
      setShowIndicator(true);
      setTimeout(() => setShowIndicator(false), 2000);
    };

    /**
     * Handles offline event
     *
     * @returns {any} The handleoffline result
     */

    /**
     * Handles offline event
     *
     * @returns {any} The handleoffline result
     */

    const handleOffline = () => {
      setIsOffline(true);
      setShowIndicator(true);
    };

    globalThis.addEventListener?.("online", handleOnline);
    globalThis.addEventListener?.("offline", handleOffline);

    return () => {
      globalThis.removeEventListener?.("online", handleOnline);
      globalThis.removeEventListener?.("offline", handleOffline);
    };
  }, []);

  // Show indicator if offline, or briefly when coming back online
  if (!showIndicator && !isOffline) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 right-0 z-[100] flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium transition-colors duration-300",
        "safe-area-inset-top",
        isOffline ? "bg-red-500 text-white" : "bg-green-500 text-white",
      )}
      role="status"
      aria-live="polite"
    >
      {isOffline ? (
        <>
          <WifiOff className="w-4 h-4" />
          <span>You're offline. Some features may be unavailable.</span>
        </>
      ) : (
        <>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>Back online</span>
        </>
      )}
    </div>
  );
}
