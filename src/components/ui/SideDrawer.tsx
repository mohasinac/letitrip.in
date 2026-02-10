"use client";

import { useEffect, useRef, useState, ReactNode, useCallback } from "react";
import { Button, Heading } from "@/components";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { useSwipe } from "@/hooks";

type DrawerMode = "create" | "edit" | "delete" | "view";

interface SideDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Drawer mode controls styling and behavior */
  mode?: DrawerMode;
  /** Whether form has unsaved changes - triggers warning on close */
  isDirty?: boolean;
}

export default function SideDrawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  mode = "view",
  isDirty = false,
}: SideDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  const attemptClose = useCallback(() => {
    if (isDirty && (mode === "create" || mode === "edit")) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  }, [isDirty, mode, onClose]);

  const confirmClose = useCallback(() => {
    setShowUnsavedWarning(false);
    onClose();
  }, [onClose]);

  const cancelClose = useCallback(() => {
    setShowUnsavedWarning(false);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        attemptClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, attemptClose]);

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

  // Swipe right to close
  useSwipe(drawerRef, {
    onSwipeRight: () => attemptClose(),
    minSwipeDistance: 60,
  });

  if (!isOpen) return null;

  const { themed, spacing, borderRadius } = THEME_CONSTANTS;

  const modeHeaderClass =
    mode === "delete"
      ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800"
      : `${themed.border} border-b`;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={attemptClose}
        aria-hidden="true"
      />

      {/* Drawer — full width on mobile, half width on desktop */}
      <div
        ref={drawerRef}
        className={`fixed right-0 top-0 bottom-0 z-50 w-full md:w-1/2 ${themed.bgPrimary} shadow-2xl flex flex-col transition-transform duration-300 ease-in-out`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between ${spacing.padding.lg} ${modeHeaderClass} border-b`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={attemptClose}
              className={`flex-shrink-0 p-2 ${themed.textSecondary} hover:${themed.textPrimary} ${borderRadius.md} hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
              aria-label={UI_LABELS.ACTIONS.CLOSE}
            >
              <svg
                className="w-5 h-5"
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
            <Heading level={3} id="drawer-title" className="truncate">
              {title}
            </Heading>
          </div>
          {mode === "delete" && (
            <span className="flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
              {UI_LABELS.ACTIONS.DELETE}
            </span>
          )}
        </div>

        {/* Content */}
        <div className={`flex-1 overflow-y-auto ${spacing.padding.lg}`}>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div
            className={`${spacing.padding.lg} ${themed.border} border-t ${themed.bgSecondary}`}
          >
            {footer}
          </div>
        )}
      </div>

      {/* Unsaved changes warning overlay */}
      {showUnsavedWarning && (
        <>
          <div
            className="fixed inset-0 z-[60] bg-black/60"
            onClick={cancelClose}
          />
          <div
            className={`fixed z-[60] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md ${themed.bgPrimary} ${borderRadius.xl} shadow-2xl p-6`}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <div>
                <h4 className={`text-base font-semibold ${themed.textPrimary}`}>
                  {UI_LABELS.CONFIRM.DISCARD}
                </h4>
                <p className={`text-sm ${themed.textSecondary} mt-1`}>
                  {UI_LABELS.CONFIRM.UNSAVED_CHANGES}
                </p>
              </div>
            </div>
            <div className="flex gap-3 justify-end">
              <Button onClick={cancelClose} variant="secondary" size="sm">
                {UI_LABELS.ACTIONS.CANCEL}
              </Button>
              <Button onClick={confirmClose} variant="danger" size="sm">
                {UI_LABELS.ACTIONS.DISCARD}
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
