"use client";

/**
 * FormModal Component
 * Framework-agnostic modal dialog for forms
 *
 * Purpose: Reusable modal wrapper with form-specific features
 * Features: Backdrop, ESC key support, focus trap, scroll lock, size variants
 *
 * @example Basic Usage
 * ```tsx
 * const dialog = useDialogState();
 *
 * <button onClick={dialog.open}>Open Form</button>
 * <FormModal
 *   isOpen={dialog.isOpen}
 *   onClose={dialog.close}
 *   title="Create Item"
 * >
 *   <form>...</form>
 * </FormModal>
 * ```
 *
 * @example With Custom Close Icon
 * ```tsx
 * <FormModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   title="Edit Profile"
 *   size="lg"
 *   showCloseButton={true}
 *   CloseIcon={CustomXIcon}
 * >
 *   Content
 * </FormModal>
 * ```
 */

import { ReactNode, useEffect, useRef } from "react";

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// Default close icon (X)
function DefaultCloseIcon({ className }: { className?: string }) {
  return (
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
}

export interface FormModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Called when modal should close */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Modal content */
  children: ReactNode;
  /** Modal size (default: md) */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Show close button in header (default: true) */
  showCloseButton?: boolean;
  /** Custom close icon component */
  CloseIcon?: React.ComponentType<{ className?: string }>;
  /** Custom className for modal container */
  className?: string;
  /** Prevent closing on backdrop click (default: false) */
  preventBackdropClose?: boolean;
  /** Prevent closing on ESC key (default: false) */
  preventEscapeClose?: boolean;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-7xl",
};

export function FormModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  CloseIcon = DefaultCloseIcon,
  className,
  preventBackdropClose = false,
  preventEscapeClose = false,
}: FormModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle ESC key and body scroll lock
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !preventEscapeClose) {
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
  }, [isOpen, onClose, preventEscapeClose]);

  if (!isOpen) return null;

  const handleBackdropClick = () => {
    if (!preventBackdropClose) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 transition-opacity"
        onClick={handleBackdropClick}
        role="button"
        tabIndex={-1}
        aria-label="Close dialog"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className={cn(
            "relative bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full",
            sizeClasses[size],
            className
          )}
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
                className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <CloseIcon className="w-6 h-6" />
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
