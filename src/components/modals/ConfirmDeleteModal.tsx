"use client";

import { useEffect } from "react";
import { Button, Heading, Text, Card } from "@/components";
import { THEME_CONSTANTS } from "@/constants";

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
  /**
   * Controls icon colour and confirm-button variant.
   * - `"danger"`  — red icon + danger button (default; use for delete / destructive bulk actions)
   * - `"warning"` — amber icon + warning button (use for reversible bulk actions)
   * - `"primary"` — blue icon + primary button (use for non-destructive bulk actions: publish, approve)
   */
  variant?: "danger" | "warning" | "primary";
}

const VARIANT_STYLES = {
  danger: {
    iconBg: "bg-red-100 dark:bg-red-900/20",
    iconColor: "text-red-600 dark:text-red-500",
    buttonVariant: "danger" as const,
    loadingText: "Deleting...",
  },
  warning: {
    iconBg: "bg-amber-100 dark:bg-amber-900/20",
    iconColor: "text-amber-600 dark:text-amber-500",
    buttonVariant: "warning" as const,
    loadingText: "Processing...",
  },
  primary: {
    iconBg: "bg-blue-100 dark:bg-blue-900/20",
    iconColor: "text-blue-600 dark:text-blue-500",
    buttonVariant: "primary" as const,
    loadingText: "Processing...",
  },
} as const;

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item?",
  message = "This action cannot be undone. Are you sure you want to delete this item?",
  confirmText = "Delete",
  cancelText = "Cancel",
  isDeleting = false,
  variant = "danger",
}: ConfirmDeleteModalProps) {
  const styles = VARIANT_STYLES[variant];
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

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

  if (!isOpen) return null;

  const { flex, position } = THEME_CONSTANTS;

  return (
    <div
      data-testid="confirm-delete-modal"
      className={`${position.fixedFill} z-50 ${flex.center} p-4 bg-black/50 backdrop-blur-sm`}
      onClick={onClose}
    >
      <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <Card
          className={`w-full max-w-md p-6 ${THEME_CONSTANTS.spacing.stack}`}
        >
          {/* Icon */}
          <div className="flex justify-center">
            <div
              className={`w-12 h-12 rounded-full ${styles.iconBg} ${flex.center}`}
            >
              <svg
                className={`w-6 h-6 ${styles.iconColor}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
          </div>

          {/* Content */}
          <div className="text-center space-y-2">
            <Heading level={4}>{title}</Heading>
            <Text className="text-sm">{message}</Text>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              variant={styles.buttonVariant}
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? styles.loadingText : confirmText}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
