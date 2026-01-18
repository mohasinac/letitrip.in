
/**
 * ConfirmDialog Component
 *
 * Framework-agnostic confirmation dialog for destructive or important actions.
 * Supports different variants (danger, warning, info) with async actions.
 *
 * @example
 * ```tsx
 * <ConfirmDialog
 *   isOpen={showConfirm}
 *   onClose={() => setShowConfirm(false)}
 *   onConfirm={handleDelete}
 *   title="Delete Product"
 *   description="This action cannot be undone."
 *   variant="danger"
 * />
 * ```
 */

import React, { useEffect, useRef, useState } from "react";

export interface ConfirmDialogProps {
  /** Dialog open state */
  isOpen: boolean;
  /** Close callback */
  onClose: () => void;
  /** Confirm action (can be async) */
  onConfirm: () => void | Promise<void>;
  /** Dialog title */
  title: string;
  /** Dialog description */
  description?: string;
  /** Custom content (overrides description) */
  children?: React.ReactNode;
  /** Confirm button label */
  confirmLabel?: string;
  /** Cancel button label */
  cancelLabel?: string;
  /** Dialog variant */
  variant?: "danger" | "warning" | "info";
  /** External loading state */
  isLoading?: boolean;
  /** Additional CSS classes */
  className?: string;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  isLoading = false,
  className = "",
}: ConfirmDialogProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // ESC key and body scroll lock
  useEffect(() => {
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

  const handleConfirm = async () => {
    setIsProcessing(true);
    try {
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Confirm action failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      button: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
      icon: "⚠️",
    },
    warning: {
      button: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
      icon: "⚡",
    },
    info: {
      button: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
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
      />

      {/* Dialog */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={dialogRef}
          className={cn(
            "relative bg-white dark:bg-gray-800 rounded-lg shadow-xl",
            "max-w-md w-full p-6",
            className
          )}
        >
          {/* Icon */}
          <div className="text-4xl mb-4">{style.icon}</div>

          {/* Title */}
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>

          {/* Description or children */}
          {children ||
            (description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                {description}
              </p>
            ))}

          {/* Actions */}
          <div className="flex gap-3 justify-end mt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg",
                "text-gray-700 dark:text-gray-300",
                "bg-gray-100 dark:bg-gray-700",
                "hover:bg-gray-200 dark:hover:bg-gray-600",
                "transition-colors",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={loading}
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-lg",
                "text-white transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                style.button,
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              {loading ? "Processing..." : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
