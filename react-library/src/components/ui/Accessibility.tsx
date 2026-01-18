"use client";

/**
 * Accessibility Components
 *
 * Framework-agnostic accessibility helper components for better ARIA support.
 *
 * @example
 * ```tsx
 * <SkipToContent contentId="main" />
 * <LiveRegion message="Item added to cart" priority="polite" />
 * <Announcer message="Loading complete" />
 * <VisuallyHidden>Screen reader only text</VisuallyHidden>
 * ```
 */

import React from "react";

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * SkipToContent Component
 *
 * Skip navigation link for keyboard users.
 * Hidden until focused, then appears at top-left.
 */
export interface SkipToContentProps {
  /** Target content ID */
  contentId?: string;
  /** Link text */
  children?: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

export function SkipToContent({
  contentId = "main-content",
  children = "Skip to main content",
  className = "",
}: SkipToContentProps) {
  return (
    <a
      href={`#${contentId}`}
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4",
        "focus:z-50 focus:px-4 focus:py-2",
        "focus:bg-blue-600 focus:text-white focus:rounded-lg",
        "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * LiveRegion Component
 *
 * ARIA live region for announcing dynamic content changes.
 */
export interface LiveRegionProps {
  /** Message to announce */
  message: string;
  /** Announcement priority */
  priority?: "polite" | "assertive";
  /** Atomic announcement */
  atomic?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function LiveRegion({
  message,
  priority = "polite",
  atomic = true,
  className = "",
}: LiveRegionProps) {
  return (
    <div
      role="status"
      aria-live={priority}
      aria-atomic={atomic}
      className={cn("sr-only", className)}
    >
      {message}
    </div>
  );
}

/**
 * Announcer Component
 *
 * Simple screen reader announcer for status updates.
 */
export interface AnnouncerProps {
  /** Message to announce */
  message: string;
  /** Additional CSS classes */
  className?: string;
}

export function Announcer({ message, className = "" }: AnnouncerProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className={cn("sr-only", className)}
    >
      {message}
    </div>
  );
}

/**
 * VisuallyHidden Component
 *
 * Hide content visually but keep it accessible to screen readers.
 */
export interface VisuallyHiddenProps {
  /** Hidden content */
  children: React.ReactNode;
  /** Show on focus */
  focusable?: boolean;
  /** HTML element type */
  as?: keyof JSX.IntrinsicElements;
  /** Additional CSS classes */
  className?: string;
}

export function VisuallyHidden({
  children,
  focusable = false,
  as: Element = "span",
  className = "",
}: VisuallyHiddenProps) {
  return (
    <Element
      className={cn(
        "sr-only",
        focusable && "focus:not-sr-only focus:absolute focus:z-50",
        className
      )}
    >
      {children}
    </Element>
  );
}

/**
 * FocusGuard Component
 *
 * Trap focus within a container (useful for modals).
 */
export interface FocusGuardProps {
  /** Guard content */
  children: React.ReactNode;
  /** Enabled state */
  enabled?: boolean;
  /** Restore focus on unmount */
  restoreFocus?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function FocusGuard({
  children,
  enabled = true,
  restoreFocus = true,
  className = "",
}: FocusGuardProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const previousFocusRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (!enabled) return;

    // Store previously focused element
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus first focusable element in container
    const focusableElements = containerRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElements && focusableElements.length > 0) {
      (focusableElements[0] as HTMLElement).focus();
    }

    // Handle Tab key to trap focus
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !containerRef.current) return;

      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          lastElement?.focus();
          e.preventDefault();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          firstElement?.focus();
          e.preventDefault();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // Restore focus
      if (restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [enabled, restoreFocus]);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
}

// Export all components
export default {
  SkipToContent,
  LiveRegion,
  Announcer,
  VisuallyHidden,
  FocusGuard,
};

