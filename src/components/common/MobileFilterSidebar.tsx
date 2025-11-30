"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { MobileFilterSidebarProps } from "@/types/inline-edit";

export function MobileFilterSidebar({
  isOpen,
  onClose,
  onApply,
  onReset,
  children,
  title = "Filters",
}: MobileFilterSidebarProps) {
  // Lock body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity md:hidden"
        onClick={handleBackdropClick}
        aria-hidden="true"
      />

      {/* Sidebar - bottom offset accounts for BottomNav (h-16) and MobileNavRow */}
      <div
        className="fixed right-0 top-0 bottom-32 w-full max-w-sm bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out md:hidden md:bottom-0"
        role="dialog"
        aria-modal="true"
        aria-labelledby="filter-sidebar-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <h2
            id="filter-sidebar-title"
            className="text-lg font-semibold text-gray-900 dark:text-white"
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            aria-label="Close filters"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>

        {/* Footer - Actions */}
        <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            type="button"
          >
            Reset
          </button>
          <button
            onClick={() => {
              onApply();
              onClose();
            }}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            type="button"
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}
