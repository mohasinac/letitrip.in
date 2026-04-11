import { trackError } from "@mohasinac/appkit/monitoring";

/**
 * Sets up window-level client error forwarding without importing the full
 * monitoring barrel, which would eagerly initialize optional Firebase modules.
 */
export function setupGlobalErrorHandler(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.addEventListener("unhandledrejection", (event) => {
    trackError(event.reason);
  });
}

export function setupCacheMonitoring(): void {}
