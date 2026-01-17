"use client";

/**
 * MobileFilterDrawer Component
 *
 * Bottom drawer for mobile filter UI with backdrop, animations, and action buttons.
 * Framework-agnostic with injectable icons.
 *
 * @example
 * ```tsx
 * <MobileFilterDrawer
 *   isOpen={showFilters}
 *   onClose={() => setShowFilters(false)}
 *   onApply={handleApply}
 *   onReset={handleReset}
 *   title="Filters"
 * >
 *   <FilterForm />
 * </MobileFilterDrawer>
 * ```
 */

import { useEffect, useState } from "react";

export interface MobileFilterDrawerProps {
  /** Whether the drawer is open */
  isOpen: boolean;
  /** Callback when drawer closes */
  onClose: () => void;
  /** Callback when Apply button is clicked (optional) */
  onApply?: () => void;
  /** Callback when Reset button is clicked (optional) */
  onReset?: () => void;
  /** Content to display in the drawer */
  children: React.ReactNode;
  /** Drawer title */
  title?: string;
  /** Additional CSS classes */
  className?: string;
  /** Hook to detect mobile (optional, defaults to always showing) */
  isMobileDetector?: () => boolean;
  /** Custom icon for filters (injectable) */
  FiltersIcon?: React.ComponentType<{ className?: string }>;
  /** Custom icon for close (injectable) */
  CloseIcon?: React.ComponentType<{ className?: string }>;
}

/** Default Filters Icon */
const DefaultFiltersIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4"
    />
  </svg>
);

/** Default Close Icon */
const DefaultCloseIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);

export function MobileFilterDrawer({
  isOpen,
  onClose,
  onApply,
  onReset,
  children,
  title = "Filters",
  className = "",
  isMobileDetector,
  FiltersIcon = DefaultFiltersIcon,
  CloseIcon = DefaultCloseIcon,
}: MobileFilterDrawerProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const isMobile = isMobileDetector ? isMobileDetector() : true;

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      // Lock body scroll when drawer is open
      if (typeof document !== "undefined") {
        document.body.style.overflow = "hidden";
      }
    } else {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "unset";
      }
    }

    return () => {
      if (typeof document !== "undefined") {
        document.body.style.overflow = "unset";
      }
    };
  }, [isOpen]);

  // Don't render on desktop if mobile detector is provided
  if (!isMobile) return null;

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  const handleApply = () => {
    if (onApply) onApply();
    handleClose();
  };

  // Don't render if not open and not animating
  if (!isOpen && !isAnimating) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen && isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
        role="button"
        tabIndex={-1}
        aria-label="Backdrop"
        onKeyDown={(e) => {
          if (e.key === "Escape") handleClose();
        }}
      />

      {/* Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 bg-white dark:bg-gray-800 rounded-t-2xl z-50 transform transition-transform duration-300 ${
          isOpen && isAnimating ? "translate-y-0" : "translate-y-full"
        } ${className}`}
        style={{ maxHeight: "85vh" }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <FiltersIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3
              id="drawer-title"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              {title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Close filters"
          >
            <CloseIcon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto px-4 py-4"
          style={{ maxHeight: "calc(85vh - 140px)" }}
        >
          {children}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 px-4 py-4 border-t border-gray-200 sticky bottom-0 bg-white dark:bg-gray-800 dark:border-gray-700">
          {onReset && (
            <button
              onClick={onReset}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              type="button"
            >
              Reset
            </button>
          )}
          {onApply && (
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              type="button"
            >
              Apply Filters
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default MobileFilterDrawer;
