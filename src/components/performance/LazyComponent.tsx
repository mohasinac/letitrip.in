/**
 * LazyComponent - Phase 9.1
 *
 * Wrapper for lazy loading heavy components below the fold.
 * Uses Intersection Observer to load components only when needed.
 *
 * Features:
 * - Lazy load on scroll into viewport
 * - Customizable loading skeleton
 * - Error boundary integration
 * - Trigger once or continuous
 *
 * @example
 * <LazyComponent
 *   loader={() => import('./HeavyChart')}
 *   fallback={<ChartSkeleton />}
 *   rootMargin="200px"
 * >
 *   <HeavyChart data={data} />
 * </LazyComponent>
 */

"use client";

import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import { cn } from "@/lib/utils";
import { ReactNode, Suspense, useRef } from "react";

interface LazyComponentProps {
  /** Component children to render when visible */
  children: ReactNode;
  /** Fallback to show while loading */
  fallback?: ReactNode;
  /** IntersectionObserver root margin */
  rootMargin?: string;
  /** IntersectionObserver threshold */
  threshold?: number;
  /** Only trigger once */
  triggerOnce?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Minimum height to prevent layout shift */
  minHeight?: string | number;
}

export function LazyComponent({
  children,
  fallback = <LazyComponentSkeleton />,
  rootMargin = "100px",
  threshold = 0.01,
  triggerOnce = true,
  className,
  minHeight,
}: LazyComponentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isVisible = useIntersectionObserver(ref, {
    rootMargin,
    threshold,
    triggerOnce,
  });

  return (
    <div
      ref={ref}
      className={cn("w-full", className)}
      style={
        minHeight
          ? {
              minHeight:
                typeof minHeight === "number" ? `${minHeight}px` : minHeight,
            }
          : undefined
      }
    >
      {isVisible ? (
        <Suspense fallback={fallback}>{children}</Suspense>
      ) : (
        fallback
      )}
    </div>
  );
}

/**
 * Default loading skeleton for lazy components
 */
export function LazyComponentSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("animate-pulse", className)}>
      <div className="h-64 bg-gray-200 dark:bg-gray-800 rounded-lg" />
    </div>
  );
}

/**
 * LazySection - Lazy load entire sections
 *
 * Use for heavy sections like product grids, image galleries, etc.
 *
 * @example
 * <LazySection title="Featured Products" fallback={<ProductGridSkeleton />}>
 *   <ProductGrid products={products} />
 * </LazySection>
 */
interface LazySectionProps {
  children: ReactNode;
  title?: string;
  fallback?: ReactNode;
  className?: string;
  minHeight?: string | number;
}

export function LazySection({
  children,
  title,
  fallback = <LazySectionSkeleton title={title} />,
  className,
  minHeight = 400,
}: LazySectionProps) {
  const ref = useRef<HTMLElement>(null);
  const isVisible = useIntersectionObserver(ref, {
    rootMargin: "200px",
    threshold: 0.01,
    triggerOnce: true,
  });

  return (
    <section
      ref={ref}
      className={cn("w-full", className)}
      style={{
        minHeight: typeof minHeight === "number" ? `${minHeight}px` : minHeight,
      }}
    >
      {title && !isVisible && (
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
          {title}
        </h2>
      )}

      {isVisible ? (
        <Suspense fallback={fallback}>{children}</Suspense>
      ) : (
        fallback
      )}
    </section>
  );
}

/**
 * Default skeleton for lazy sections
 */
export function LazySectionSkeleton({
  title,
  className,
}: {
  title?: string;
  className?: string;
}) {
  return (
    <div className={cn("animate-pulse", className)}>
      {title && (
        <div className="h-8 w-48 bg-gray-200 dark:bg-gray-800 rounded mb-6" />
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-48 bg-gray-200 dark:bg-gray-800 rounded-lg" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * LazyModal - Lazy load modal content
 *
 * Only loads modal content when opened.
 *
 * @example
 * <LazyModal isOpen={isOpen} onClose={closeModal}>
 *   <HeavyModalContent />
 * </LazyModal>
 */
interface LazyModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}

export function LazyModal({
  isOpen,
  onClose,
  children,
  fallback = <div className="p-8 text-center">Loading...</div>,
  className,
}: LazyModalProps) {
  // Only render modal content when opened
  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center",
        "bg-black bg-opacity-50 backdrop-blur-sm",
        className,
      )}
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-4xl max-h-[90vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <Suspense fallback={fallback}>{children}</Suspense>
      </div>
    </div>
  );
}
