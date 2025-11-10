/**
 * Accessibility components for better ARIA support
 */

"use client";

/**
 * Skip to content link component
 */
export function SkipToContent({
  contentId = "main-content",
}: {
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
export function LiveRegion({
  message,
  priority = "polite",
  atomic = true,
}: {
  message: string;
  priority?: "polite" | "assertive";
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
