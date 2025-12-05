/**
 * @fileoverview React Component
 * @module src/components/common/Accessibility
 * @description This file contains the Accessibility component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Accessibility components for better ARIA support
 */

"use client";

/**
 * Skip to content link component
 */
/**
 * Performs skip to content operation
 *
 * @param {{
  contentId?} [{
  contentId] - {
  content identifier
 *
 * @returns {string} The skiptocontent result
 *
 * @example
 * SkipToContent({});
 */

/**
 * Performs skip to content operation
 *
 * @returns {string} The skiptocontent result
 *
 * @example
 * SkipToContent();
 */

export function SkipToContent({
  contentId = "main-content",
}: {
  /** Content Id */
  contentId?: string;
}) {
  return (
    <a
      href={`#${contentId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-blue-600 focus:text-white focus:rounded-lg"
    >
      Skip to main content
    </a>
  );
}

/**
 * ARIA live region for dynamic content
 */
/**
 * Performs live region operation
 *
 * @returns {any} The liveregion result
 *
 * @example
 * LiveRegion();
 */

/**
 * Performs live region operation
 *
 * @returns {any} The liveregion result
 *
 * @example
 * LiveRegion();
 */

export function LiveRegion({
  message,
  priority = "polite",
  atomic = true,
}: {
  /** Message */
  message: string;
  /** Priority */
  priority?: "polite" | "assertive";
  /** Atomic */
  atomic?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      className="sr-only"
    >
      {message}
    </div>
  );
}

/**
 * Screen reader announcer component
 */
/**
 * Performs announcer operation
 *
 * @param {{ message} { message } - The { message }
 *
 * @returns {string} The announcer result
 *
 * @example
 * Announcer({});
 */

/**
 * Performs announcer operation
 *
 * @param {{ message} { message } - The { message }
 *
 * @returns {string} The announcer result
 *
 * @example
 * Announcer({});
 */

export function Announcer({ message }: { message: string }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {message}
    </div>
  );
}
