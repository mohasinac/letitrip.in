/**
 * InlineFormModal Component
 * Framework-agnostic lightweight inline modal for quick forms
 *
 * Purpose: Simpler, inline modal for small forms and quick edits
 * Difference from FormModal: Lighter styling, no separate header/content sections
 *
 * @example Basic Usage
 * ```tsx
 * const dialog = useDialogState();
 *
 * <button onClick={dialog.open}>Quick Edit</button>
 * <InlineFormModal
 *   isOpen={dialog.isOpen}
 *   onClose={dialog.close}
 *   title="Quick Edit"
 * >
 *   <form>...</form>
 * </InlineFormModal>
 * ```
 *
 * @example With Custom Icon
 * ```tsx
 * <InlineFormModal
 *   isOpen={isOpen}
 *   onClose={onClose}
 *   title="Add Tag"
 *   size="sm"
 *   CloseIcon={CustomXIcon}
 * >
 *   Content
 * </InlineFormModal>
 * ```
 */

import { ReactNode } from "react";

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

export interface InlineFormModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Called when modal should close */
  onClose: () => void;
  /** Modal title */
  title: string;
  /** Modal content */
  children: ReactNode;
  /** Modal size (default: md) */
  size?: "sm" | "md" | "lg" | "xl";
  /** Custom close icon component */
  CloseIcon?: React.ComponentType<{ className?: string }>;
  /** Custom className for modal container */
  className?: string;
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-6xl",
};

export function InlineFormModal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  CloseIcon = DefaultCloseIcon,
  className,
}: InlineFormModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 transition-opacity"
          onClick={onClose}
          onKeyDown={(e) => e.key === "Escape" && onClose()}
          role="button"
          tabIndex={-1}
          aria-label="Close modal"
        />

        {/* Modal */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="inline-modal-title"
          className={cn(
            "relative w-full rounded-lg bg-white dark:bg-gray-800 shadow-xl",
            sizeClasses[size],
            className
          )}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <h3
              id="inline-modal-title"
              className="text-lg font-semibold text-gray-900 dark:text-white"
            >
              {title}
            </h3>
            <button
              onClick={onClose}
              aria-label="Close modal"
              className="rounded-lg p-1 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="px-6 py-4">{children}</div>
        </div>
      </div>
    </div>
  );
}
