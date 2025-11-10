/**
 * Accessibility utilities and hooks
 */

"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Hook to manage focus trap within a component
 */
export function useFocusTrap(isActive: boolean = true) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    );

    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[
      focusableElements.length - 1
    ] as HTMLElement;

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener("keydown", handleTabKey);

    // Focus first element on mount
    firstElement?.focus();

    return () => {
      container.removeEventListener("keydown", handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook to announce messages to screen readers
 */
export function useAnnouncer() {
  const [message, setMessage] = useState("");

  const announce = (
    text: string,
    priority: "polite" | "assertive" = "polite",
  ) => {
    setMessage(""); // Clear first
    setTimeout(() => {
      setMessage(text);
    }, 100);
  };

  return {
    message,
    announce,
  };
}

/**
 * Generate unique IDs for ARIA attributes
 */
let idCounter = 0;
export function useId(prefix: string = "id"): string {
  const [id] = useState(() => `${prefix}-${++idCounter}`);
  return id;
}

/**
 * Hook to handle keyboard navigation
 */
export function useKeyboardNavigation(
  items: any[],
  onSelect: (index: number) => void,
  options: {
    loop?: boolean;
    initialIndex?: number;
  } = {},
) {
  const { loop = true, initialIndex = -1 } = options;
  const [focusedIndex, setFocusedIndex] = useState(initialIndex);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const maxIndex = items.length - 1;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev + 1;
          if (next > maxIndex) return loop ? 0 : maxIndex;
          return next;
        });
        break;

      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => {
          const next = prev - 1;
          if (next < 0) return loop ? maxIndex : 0;
          return next;
        });
        break;

      case "Home":
        e.preventDefault();
        setFocusedIndex(0);
        break;

      case "End":
        e.preventDefault();
        setFocusedIndex(maxIndex);
        break;

      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0 && focusedIndex <= maxIndex) {
          onSelect(focusedIndex);
        }
        break;

      case "Escape":
        setFocusedIndex(-1);
        break;
    }
  };

  return {
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
  };
}

/**
 * Check if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return prefersReducedMotion;
}

/**
 * Screen reader only CSS class utility
 */
export const srOnly =
  "sr-only absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0";

/**
 * Get ARIA label for rating
 */
export function getRatingLabel(rating: number, maxRating: number = 5): string {
  return `Rated ${rating} out of ${maxRating} stars`;
}

/**
 * Get ARIA label for price
 */
export function getPriceLabel(price: number, currency: string = "INR"): string {
  return `Price: ${price.toLocaleString()} ${currency}`;
}
