/**
 * @fileoverview React Component
 * @module src/components/common/FormModal
 * @description This file contains the FormModal component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import { ReactNode, useEffect, useRef } from "react";

/**
 * FormModalProps interface
 * 
 * @interface
 * @description Defines the structure and contract for FormModalProps
 */
export interface FormModalProps {
  /** Is Open */
  isOpen: boolean;
  /** On Close */
  onClose: () => void;
  /** Title */
  title: string;
  /** Children */
  children: ReactNode;
  /** Size */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Show Close Button */
  showCloseButton?: boolean;
}

const sizeClasses = {
  /** Sm */
  sm: "max-w-md",
  /** Md */
  md: "max-w-lg",
  /** Lg */
  lg: "max-w-2xl",
  /** Xl */
  xl: "max-w-4xl",
  /** Full */
  full: "max-w-7xl",
};

/**
 * Function: Form Modal
 */
/**
 * Performs form modal operation
 *
 * @returns {any} The formmodal result
 *
 * @example
 * FormModal();
 */

/**
 * Performs form modal operation
 *
 * @returns {any} The formmodal result
 *
 * @example
 * FormModal();
 */

export function FormModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}: FormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    /**
     * Handles escape event
     *
     * @param {KeyboardEvent} e - The e
     *
     * @returns {any} The handleescape result
     */

    /**
     * Handles escape event
     *
     * @param {KeyboardEvent} e - The e
     *
     * @returns {any} The handleescape result
     */

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close modal"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className={`relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full ${sizeClasses[size]}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2
              id="modal-title"
              className="text-xl font-semibold text-gray-900 dark:text-white"
            >
              {title}
            </h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                aria-label="Close modal"
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300"
              >
                <svg
                  className="w-6 h-6"
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
              </button>
            )}
          </div>

          {/* Content */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
