
/**
 * useNavigationGuard Hook
 *
 * Framework-agnostic navigation guard to prevent leaving pages with unsaved changes.
 * Works with browser back/forward, route changes, and page refreshes.
 *
 * @example
 * ```tsx
 * useNavigationGuard({
 *   enabled: hasUnsavedChanges,
 *   message: "You have unsaved changes. Leave anyway?",
 *   onNavigate: async () => {
 *     await cleanupUploads();
 *   },
 * });
 * ```
 */

import { useEffect, useRef } from "react";

export interface NavigationGuardOptions {
  /** Whether to enable the navigation guard */
  enabled: boolean;

  /** Custom message to show in confirmation dialog */
  message?: string;

  /**
   * Callback when user confirms navigation (before leaving)
   * Use this to cleanup uploaded media or save drafts
   */
  onNavigate?: () => Promise<void> | void;

  /** Callback when user cancels navigation (stays on page) */
  onCancel?: () => void;

  /** Error handler for cleanup failures */
  onError?: (error: Error) => void;

  /** Custom confirm dialog (default: window.confirm) */
  confirm?: (message: string) => boolean | Promise<boolean>;
}

export function useNavigationGuard(options: NavigationGuardOptions): void {
  const {
    enabled,
    message = "You have unsaved changes. Do you want to leave this page?",
    onNavigate,
    onCancel,
    onError,
    confirm: customConfirm,
  } = options;

  const isNavigatingRef = useRef(false);

  /**
   * Handle browser beforeunload event (page refresh, close tab)
   */
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Modern browsers ignore custom messages and show their own
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    if (typeof window !== "undefined") {
      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    }
  }, [enabled, message]);

  /**
   * Handle history/router navigation
   */
  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    const handlePopState = async (e: PopStateEvent) => {
      if (isNavigatingRef.current) return;

      // Show confirmation dialog
      const confirmFn = customConfirm || ((msg: string) => window.confirm(msg));
      const confirmed = await confirmFn(message);

      if (confirmed) {
        isNavigatingRef.current = true;

        // Run cleanup callback
        if (onNavigate) {
          try {
            await onNavigate();
          } catch (error) {
            onError?.(error as Error);
          }
        }

        // Allow navigation
        isNavigatingRef.current = false;
      } else {
        // Cancel navigation - push state back
        window.history.pushState(null, "", window.location.href);
        onCancel?.();
      }
    };

    // Add initial state to enable popstate detection
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [enabled, message, onNavigate, onCancel, onError, customConfirm]);
}

export default useNavigationGuard;
