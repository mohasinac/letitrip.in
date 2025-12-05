/**
 * @fileoverview React Component
 * @module src/components/common/ConfirmDialog
 * @description This file contains the ConfirmDialog component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { ReactNode, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { logError } from "@/lib/error-logger";

/**
 * ConfirmDialogProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ConfirmDialogProps
 */
export interface ConfirmDialogProps {
  /** Is Open */
  isOpen: boolean;
  /** On Close */
  onClose: () => void;
  /** On Confirm */
  onConfirm: () => void | Promise<void>;
  /** Title */
  title: string;
  /** Description */
  description?: string;
  /** Children */
  children?: React.ReactNode; // Support custom content
  /** Confirm Label */
  confirmLabel?: string;
  /** Cancel Label */
  cancelLabel?: string;
  /** Variant */
  variant?: "danger" | "warning" | "info";
  /** Is Loading */
  isLoading?: boolean;
}

/**
 * Function: Confirm Dialog
 */
/**
 * Performs confirm dialog operation
 *
 * @returns {any} The confirmdialog result
 *
 * @example
 * ConfirmDialog();
 */

/**
 * Performs confirm dialog operation
 *
 * @returns {any} The confirmdialog result
 *
 * @example
 * ConfirmDialog();
 */

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children, // Add children destructuring
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  /**
 * Performs dialog ref operation
 *
 * @param {any} null - The null
 *
 * @returns {any} The dialogref result
 *
 */
const dialogRef = useRef<HTMLDivElement>(null);

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
      if (e.key === "Escape" && !isProcessing) {
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
  }, [isOpen, isProcessing, onClose]);

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  /**
   * Performs async operation
   *
   * @returns {Promise<any>} Promise resolving to async  result
   *
   * @throws {Error} When operation fails or validation errors occur
   */

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      logError(error as Error, { component: "ConfirmDialog.handleConfirm" });
      toast.error("Action failed");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const variantStyles = {
    /** Danger */
    danger: {
      /** Button */
      button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      /** Icon */
      icon: "⚠️",
    },
    /** Warning */
    warning: {
      /** Button */
      button: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
      /** Icon */
      icon: "⚡",
    },
    /** Info */
    info: {
      /** Button */
      button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
      /** Icon */
      icon: "ℹ️",
    },
  };

  const style = variantStyles[variant];
  const loading = isLoading || isProcessing;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={() => !loading && onClose()}
        onKeyDown={(e) => e.key === "Escape" && !loading && onClose()}
        role="button"
        tabIndex={-1}
        aria-label="Close dialog"
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={dialogRef}
          className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6"
        >
          {/* Icon */}
          <div className="mb-4 text-4xl text-center">{style.icon}</div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
            {title}
          </h3>

          {/* Description */}
          {description && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center">
              {description}
            </p>
          )}

          {/* Custom Content */}
          {children}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              disabled={loading}
              className={`flex-1 px-4 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${style.button}`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Processing...
                </span>
              ) : (
                confirmLabel
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
