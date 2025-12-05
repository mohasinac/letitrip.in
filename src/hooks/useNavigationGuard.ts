/**
 * @fileoverview TypeScript Module
 * @module src/hooks/useNavigationGuard
 * @description This file contains functionality related to useNavigationGuard
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * useNavigationGuard Hook
 *
 * Prevents navigation away from a page with unsaved changes.
 * Works with browser back/forward, route changes, and page refreshes.
 * Integrates with media cleanup to delete uploaded files on navigation.
 */

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { logError } from "@/lib/firebase-error-logger";

/**
 * NavigationGuardOptions interface
 * 
 * @interface
 * @description Defines the structure and contract for NavigationGuardOptions
 */
export interface NavigationGuardOptions {
  /**
   * Whether to enable the navigation guard
   */
  enabled: boolean;

  /**
   * Custom message to show in the confirmation dialog
   * Default: "You have unsaved changes. Do you want to leave this page?"
   */
  message?: string;

  /**
   * Callback when user confirms navigation (before leaving)
   * Use this to cleanup uploaded media
   */
  onNavigate?: () => Promise<void> | void;

  /**
   * Callback when user cancels navigation (stays on page)
   */
  onCancel?: () => void;
}

/**
 * Function: Use Navigation Guard
 */
/**
 * Custom React hook for navigation guard
 *
 * @param {NavigationGuardOptions} options - Configuration options
 *
 * @returns {any} The usenavigationguard result
 *
 * @example
 * useNavigationGuard(options);
 */

/**
 * Custom React hook for navigation guard
 *
 * @param {NavigationGuardOptions} options - Configuration options
 *
 * @returns {any} The usenavigationguard result
 *
 * @example
 * useNavigationGuard(options);
 */

export function useNavigationGuard(options: NavigationGuardOptions) {
  const {
    enabled,
    message = "You have unsaved changes. Do you want to leave this page?",
    onNavigate,
    onCancel,
  } = options;

  const router = useRouter();
  const isNavigatingRef = useRef(false);

  /**
   * Handle browser beforeunload event (page refresh, close tab)
   */
  useEffect(() => {
    if (!enabled) return;

    /**
     * Handles before unload event
     *
     * @param {BeforeUnloadEvent} e - The e
     *
     * @returns {any} The handlebeforeunload result
     */

    /**
     * Handles before unload event
     *
     * @param {BeforeUnloadEvent} e - The e
     *
     * @returns {any} The handlebeforeunload result
     */

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Modern browsers ignore custom messages and show their own
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    globalThis.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      globalThis.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [enabled, message]);

  /**
   * Handle Next.js route changes
   * Note: Next.js App Router doesn't have a built-in way to intercept navigation,
   * so we need to use window history events
   */
  useEffect(() => {
    if (!enabled) return;

    let isBlocking = false;

    /**
     * Performs async operation
     *
     * @param {PopStateEvent} e - The e
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    /**
     * Performs async operation
     *
     * @param {PopStateEvent} e - The e
     *
     * @returns {Promise<any>} Promise resolving to async  result
     *
     * @throws {Error} When operation fails or validation errors occur
     */

    const handlePopState = async (e: PopStateEvent) => {
      if (isNavigatingRef.current) return;

      // Show confirmation dialog
      const confirmed = globalThis.confirm?.(message) ?? true;

      if (confirmed) {
        isNavigatingRef.current = true;

        // Run cleanup callback
        if (onNavigate) {
          try {
            await onNavigate();
          } catch (error: any) {
            logError(error as Error, {
              /** Component */
              component: "useNavigationGuard.onNavigate.beforeUnload",
            });
          }
        }

        // Allow navigation
        isNavigatingRef.current = false;
      } else {
        // Cancel navigation - push the current state back
        if (onCancel) {
          onCancel();
        }

        // Prevent the navigation by pushing current state back
        globalThis.history?.pushState(null, "", globalThis.location?.href);
      }
    };

    // Push an initial state to enable popstate detection
    globalThis.history?.pushState(null, "", globalThis.location?.href);

    globalThis.addEventListener("popstate", handlePopState);

    return () => {
      globalThis.removeEventListener("popstate", handlePopState);
    };
  }, [enabled, message, onNavigate, onCancel]);

  /**
   * Manually trigger navigation guard for custom navigation
   * Use this when programmatically navigating (e.g., form submission, button clicks)
   */
  const confirmNavigation = useCallback(
    async (callback: () => void | Promise<void>): Promise<boolean> => {
      if (!enabled) {
        await callback();
        return true;
      }

      const confirmed = globalThis.confirm?.(message) ?? true;

      if (confirmed) {
        isNavigatingRef.current = true;

        // Run cleanup
        if (onNavigate) {
          try {
            await onNavigate();
          } catch (error: any) {
            logError(error as Error, {
              /** Component */
              component: "useNavigationGuard.onNavigate.confirmNavigation",
            });
          }
        }

        // Execute the callback
        await callback();

        isNavigatingRef.current = false;
        return true;
      } else {
        if (onCancel) {
          onCancel();
        }
        return false;
      }
    },
    [enabled, message, onNavigate, onCancel],
  );

  return {
    confirmNavigation,
    /** Is Navigating */
    isNavigating: isNavigatingRef.current,
  };
}
