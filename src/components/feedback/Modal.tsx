"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { THEME_CONSTANTS } from "@/constants";
import { useSwipe } from "@/hooks";
import { preventBodyScroll } from "@/utils";

/**
 * Modal Component
 *
 * A flexible modal dialog component with backdrop, multiple sizes, and keyboard support.
 * Automatically manages body scroll lock and supports ESC key to close.
 * Renders using React Portal for proper z-index layering.
 *
 * @component
 * @example
 * ```tsx
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   size="md"
 * >
 *   Are you sure you want to proceed?
 * </Modal>
 * ```
 */

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  showCloseButton?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
}: ModalProps) {
  const { themed, card, typography } = THEME_CONSTANTS;
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);
  const [translateY, setTranslateY] = useState(0);
  const titleId = useId();

  // Check if swipe should be disabled (e.g., during image crop)
  const [isSwipeDisabled, setIsSwipeDisabled] = useState(false);

  useEffect(() => {
    // Check if any child element has data-disable-swipe attribute
    const checkSwipeDisabled = () => {
      if (modalRef.current) {
        const hasDisableSwipe = modalRef.current.querySelector(
          '[data-disable-swipe="true"]',
        );
        setIsSwipeDisabled(!!hasDisableSwipe);
      }
    };

    checkSwipeDisabled();

    // Use MutationObserver to detect changes
    const observer = new MutationObserver(checkSwipeDisabled);
    if (modalRef.current) {
      observer.observe(modalRef.current, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    }

    return () => observer.disconnect();
  }, [isOpen]);

  // Swipe down to close modal on mobile (only when not disabled)
  useSwipe(modalRef, {
    onSwiping: (deltaX, deltaY) => {
      if (!isSwipeDisabled && deltaY > 0) {
        setTranslateY(deltaY);
      }
    },
    onSwipeDown: (distance) => {
      if (!isSwipeDisabled && distance > 100) {
        onClose();
      }
      setTranslateY(0);
    },
    onSwipeEnd: () => {
      if (!isSwipeDisabled) {
        setTranslateY(0);
      }
    },
    minSwipeDistance: 100,
  });

  // Manage body scroll
  useEffect(() => {
    preventBodyScroll(isOpen);
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  // Focus trap: save previously focused element, move focus into modal, trap Tab
  const handleFocusTrap = useCallback((e: KeyboardEvent) => {
    if (e.key !== "Tab" || !modalRef.current) return;

    const focusableSelectors =
      'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
    const focusableElements =
      modalRef.current.querySelectorAll<HTMLElement>(focusableSelectors);
    if (focusableElements.length === 0) return;

    const first = focusableElements[0];
    const last = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Save the element that had focus before the modal opened
    previouslyFocusedRef.current = document.activeElement as HTMLElement;

    // Move focus into the modal
    const timer = setTimeout(() => {
      if (modalRef.current) {
        const firstFocusable = modalRef.current.querySelector<HTMLElement>(
          'button:not([disabled]), [tabindex]:not([tabindex="-1"]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href]',
        );
        if (firstFocusable) {
          firstFocusable.focus();
        } else {
          modalRef.current.focus();
        }
      }
    }, 50);

    document.addEventListener("keydown", handleFocusTrap);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("keydown", handleFocusTrap);

      // Restore focus when modal closes
      if (previouslyFocusedRef.current && previouslyFocusedRef.current.focus) {
        previouslyFocusedRef.current.focus();
      }
    };
  }, [isOpen, handleFocusTrap]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        ref={modalRef}
        className={`
          w-full ${sizeClasses[size]}
          ${themed.bgSecondary}
          ${card.base}
          shadow-2xl
          fixed top-1/2 left-1/2
          max-h-[85vh] flex flex-col
          animate-fade-in
          touch-pan-y
        `}
        style={{
          transform:
            translateY > 0
              ? `translate(-50%, calc(-50% + ${translateY}px))`
              : "translate(-50%, -50%)",
          transition: translateY > 0 ? "none" : undefined,
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        {(title || showCloseButton) && (
          <div
            className={`flex items-center justify-between p-6 border-b ${themed.borderLight}`}
          >
            {title && (
              <h2
                id={titleId}
                className={`${THEME_CONSTANTS.typography.h4} ${themed.textPrimary}`}
              >
                {title}
              </h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${themed.hover}`}
                aria-label="Close modal"
              >
                <svg
                  className={`w-5 h-5 ${themed.textMuted}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
        )}

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

// Modal Footer Component
export function ModalFooter({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { themed, spacing } = THEME_CONSTANTS;
  return (
    <div
      className={`p-6 border-t ${themed.borderLight} flex items-center justify-end ${spacing.inline} ${className}`}
    >
      {children}
    </div>
  );
}
