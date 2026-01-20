/**
 * useIntersectionObserver Hook - Phase 9.1
 *
 * React hook for Intersection Observer API.
 * Used for lazy loading images, components, and triggering animations.
 *
 * @example
 * const ref = useRef(null);
 * const isVisible = useIntersectionObserver(ref, { threshold: 0.1 });
 *
 * return (
 *   <div ref={ref}>
 *     {isVisible && <HeavyComponent />}
 *   </div>
 * );
 */

"use client";

import { RefObject, useEffect, useState } from "react";

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  /** Trigger once and cleanup */
  triggerOnce?: boolean;
  /** Initial state before observation */
  initialIsIntersecting?: boolean;
}

export function useIntersectionObserver(
  ref: RefObject<Element>,
  options: UseIntersectionObserverOptions = {},
): boolean {
  const {
    threshold = 0,
    root = null,
    rootMargin = "0px",
    triggerOnce = false,
    initialIsIntersecting = false,
  } = options;

  const [isIntersecting, setIsIntersecting] = useState(initialIsIntersecting);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === "undefined") {
      // Fallback for unsupported browsers
      setIsIntersecting(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        setIsIntersecting(isElementIntersecting);

        // Cleanup if triggerOnce and now intersecting
        if (isElementIntersecting && triggerOnce && observer) {
          observer.unobserve(element);
        }
      },
      { threshold, root, rootMargin },
    );

    observer.observe(element);

    return () => {
      if (observer && element) {
        observer.unobserve(element);
      }
    };
  }, [ref, threshold, root, rootMargin, triggerOnce]);

  return isIntersecting;
}
