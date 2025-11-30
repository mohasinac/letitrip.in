/**
 * Mobile filter drawer component
 */

"use client";

import { X, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/useMobile";

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply?: () => void;
  onReset?: () => void;
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export default function MobileFilterDrawer({
  isOpen,
  onClose,
  onApply,
  onReset,
  children,
  title = "Filters",
  className = "",
}: MobileFilterDrawerProps) {
  const isMobile = useIsMobile();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsAnimating(true);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isMobile) return null;

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(onClose, 300);
  };

  const handleApply = () => {
    if (onApply) onApply();
    handleClose();
  };

  if (!isOpen && !isAnimating) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
          isOpen && isAnimating ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
        onKeyDown={(e) => e.key === "Escape" && handleClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close filters"
      />

      {/* Drawer */}
      <div
        className={`fixed inset-x-0 bottom-0 bg-white dark:bg-gray-800 rounded-t-2xl z-50 transform transition-transform duration-300 ${
          isOpen && isAnimating ? "translate-y-0" : "translate-y-full"
        } ${className}`}
        style={{ maxHeight: "85vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <div
          className="overflow-y-auto px-4 py-4"
          style={{ maxHeight: "calc(85vh - 140px)" }}
        >
          {children}
        </div>

        {/* Footer Actions - bottom-32 accounts for BottomNav (h-16) + MobileNavRow (h-16) */}
        <div className="flex items-center gap-3 px-4 py-4 border-t border-gray-200 sticky bottom-32 bg-white dark:bg-gray-800 dark:border-gray-700">
          {onReset && (
            <button
              onClick={onReset}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Reset
            </button>
          )}
          {onApply && (
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Apply Filters
            </button>
          )}
        </div>
      </div>
    </>
  );
}
