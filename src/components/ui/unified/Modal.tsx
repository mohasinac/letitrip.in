/**
 * Unified Modal Component
 * Single source of truth for all modal/dialog variants
 * Accessible, responsive, and theme-aware
 */

"use client";

import React, { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface UnifiedModalProps {
  // Visibility
  open: boolean;
  onClose: () => void;

  // Content
  title?: string;
  children: React.ReactNode;

  // Size
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";

  // Behavior
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  showCloseButton?: boolean;

  // Style
  centered?: boolean;
  padding?: "none" | "sm" | "md" | "lg";

  // Header/Footer
  header?: React.ReactNode;
  footer?: React.ReactNode;

  // Animation
  animation?: "fade" | "slide" | "zoom";

  // Accessibility
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const sizeClasses = {
  xs: "max-w-xs",
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  full: "max-w-full mx-4",
};

const paddingClasses = {
  none: "p-0",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

const animationClasses = {
  fade: "animate-fadeIn",
  slide: "animate-slideUp",
  zoom: "animate-fadeIn scale-95",
};

export const UnifiedModal: React.FC<UnifiedModalProps> = ({
  open,
  onClose,
  title,
  children,
  size = "md",
  closeOnBackdropClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  centered = true,
  padding = "md",
  header,
  footer,
  animation = "fade",
  ariaLabel,
  ariaDescribedBy,
}) => {
  // Handle escape key
  useEffect(() => {
    if (!open || !closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && closeOnBackdropClick) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose]
  );

  if (!open) return null;

  const modalContent = (
    <div
      className={cn(
        "fixed inset-0 z-modalBackdrop flex items-center justify-center",
        centered ? "items-center" : "items-start pt-20"
      )}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
        aria-describedby={ariaDescribedBy}
        className={cn(
          "relative bg-surface rounded-lg shadow-xl",
          "w-full max-h-[90vh] overflow-hidden flex flex-col",
          sizeClasses[size],
          animationClasses[animation]
        )}
      >
        {/* Header */}
        {(title || header || showCloseButton) && (
          <div
            className={cn(
              "flex items-center justify-between border-b border-border",
              paddingClasses[padding],
              padding === "none" && "p-4"
            )}
          >
            <div className="flex-1">
              {header || (
                <h2 className="text-xl font-semibold text-text">{title}</h2>
              )}
            </div>

            {showCloseButton && (
              <button
                onClick={onClose}
                className={cn(
                  "ml-4 p-2 rounded-md",
                  "text-textSecondary hover:text-text hover:bg-surfaceVariant",
                  "transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                )}
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div
          className={cn(
            "flex-1 overflow-y-auto",
            paddingClasses[padding],
            !title && !header && showCloseButton && "pt-12" // Space for close button if no header
          )}
        >
          {/* Close button without header */}
          {!title && !header && showCloseButton && (
            <button
              onClick={onClose}
              className={cn(
                "absolute top-4 right-4 p-2 rounded-md",
                "text-textSecondary hover:text-text hover:bg-surfaceVariant",
                "transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
              )}
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          )}

          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={cn(
              "border-t border-border",
              paddingClasses[padding],
              padding === "none" && "p-4"
            )}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );

  // Render in portal
  return typeof document !== "undefined"
    ? createPortal(modalContent, document.body)
    : null;
};

// ============================================================================
// MODAL FOOTER HELPER
// ============================================================================

export interface ModalFooterProps {
  children: React.ReactNode;
  align?: "left" | "center" | "right" | "between";
  className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({
  children,
  align = "right",
  className,
}) => {
  const alignClasses = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
    between: "justify-between",
  };

  return (
    <div
      className={cn("flex items-center gap-2", alignClasses[align], className)}
    >
      {children}
    </div>
  );
};

// ============================================================================
// CONFIRMATION MODAL
// ============================================================================

export interface ConfirmModalProps
  extends Omit<UnifiedModalProps, "children" | "footer"> {
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  variant?: "default" | "danger" | "warning";
  loading?: boolean;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  onClose,
  variant = "default",
  loading = false,
  ...props
}) => {
  const variantColors = {
    default: "bg-primary hover:bg-primary/90",
    danger: "bg-error hover:bg-error/90",
    warning: "bg-warning hover:bg-warning/90",
  };

  return (
    <UnifiedModal
      {...props}
      onClose={onClose}
      size="sm"
      footer={
        <ModalFooter align="right">
          <button
            onClick={onClose}
            disabled={loading}
            className={cn(
              "px-4 py-2 rounded-md border-2 border-border",
              "text-text hover:bg-surfaceVariant",
              "transition-colors disabled:opacity-50"
            )}
          >
            {cancelText}
          </button>
          <button
            onClick={() => {
              onConfirm();
              if (!loading) onClose();
            }}
            disabled={loading}
            className={cn(
              "px-4 py-2 rounded-md text-white",
              variantColors[variant],
              "transition-colors disabled:opacity-50"
            )}
          >
            {loading ? "Loading..." : confirmText}
          </button>
        </ModalFooter>
      }
    >
      <p className="text-text">{message}</p>
    </UnifiedModal>
  );
};

export default UnifiedModal;
