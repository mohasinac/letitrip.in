"use client";

import { useEffect, useRef, useState, ReactNode, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button, Heading, Span, Text } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
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
  /** Which side the drawer opens from. Defaults to 'right'. */
  side?: "left" | "right";
}

/** Selector for all keyboard-focusable elements */
const FOCUSABLE_SELECTOR =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

function getFocusableElements(container: HTMLElement | null): Element[] {
  if (!container) return [];
  return Array.from(container.querySelectorAll(FOCUSABLE_SELECTOR));
}

export default function SideDrawer({
  isOpen,
  onClose,
  title,
  children,
  footer,
  mode = "view",
  isDirty = false,
  side = "right",
}: SideDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const tActions = useTranslations("actions");
  const tConfirm = useTranslations("confirm");
  // Store the element that was focused before the drawer opened so we can
  // restore focus when it closes (WCAG 2.4.3 focus order requirement).
  const triggerRef = useRef<Element | null>(null);

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        attemptClose();
        return;
      }

      // Focus trap: keep Tab / Shift+Tab cycling inside the drawer
      if (e.key === "Tab" && drawerRef.current) {
        const focusable = getFocusableElements(drawerRef.current);
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
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
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, attemptClose]);

  // Save / restore focus on open / close (WCAG 2.4.3)
  useEffect(() => {
    if (isOpen) {
      // Save the element that currently has focus so we can restore it later
      triggerRef.current = document.activeElement;
      // Move focus to the first focusable element inside the drawer
      requestAnimationFrame(() => {
        const focusable = getFocusableElements(drawerRef.current);
        if (focusable.length > 0) {
          (focusable[0] as HTMLElement).focus();
        }
      });
    } else {
      // Return focus to the trigger element when the drawer closes
      if (triggerRef.current && "focus" in triggerRef.current) {
        (triggerRef.current as HTMLElement).focus();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Compensate for scrollbar disappearing so content doesn't shift
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isOpen]);

  // Swipe towards the edge to close
  useSwipe(drawerRef, {
    ...(side === "left"
      ? { onSwipeLeft: () => attemptClose() }
      : { onSwipeRight: () => attemptClose() }),
    minSwipeDistance: 60,
  });

  if (!isOpen) return null;

  const { themed, flex } = THEME_CONSTANTS;

  const positionClass =
    side === "left"
      ? "left-0 w-full sm:w-96 md:w-[420px]"
      : "right-0 w-full md:w-1/2 md:max-w-[560px]";

  const modeHeaderStyles: Record<DrawerMode, string> = {
    delete: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
    create: `bg-gradient-to-r from-primary/5 via-transparent to-teal-50/30 dark:from-primary/10 dark:via-transparent dark:to-teal-950/10 ${themed.border}`,
    edit: `bg-gradient-to-r from-amber-50/40 via-transparent to-primary/5 dark:from-amber-950/15 dark:via-transparent dark:to-primary/10 ${themed.border}`,
    view: `${themed.bgSecondary} ${themed.border}`,
  };

  const modeHeaderClass = modeHeaderStyles[mode];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={attemptClose}
        aria-hidden="true"
      />

      {/* Drawer — full width on mobile, wider on desktop */}
      <div
        ref={drawerRef}
        className={`fixed ${positionClass} top-0 bottom-0 z-50 ${themed.bgPrimary} shadow-2xl flex flex-col transition-transform duration-300 ease-in-out`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
      >
        {/* Header */}
        <div className={`${flex.between} p-6 ${modeHeaderClass} border-b`}>
          <div className={`${flex.rowCenter} gap-3 min-w-0`}>
            <Button
              variant="ghost"
              onClick={attemptClose}
              className={`${flex.noShrink} p-2 ${themed.textSecondary} rounded-lg ${themed.hover} transition-colors ring-1 ring-zinc-200 dark:ring-slate-700 hover:ring-zinc-300 dark:hover:ring-slate-600`}
              aria-label={tActions("close")}
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
            </Button>
            <Heading level={3} id="drawer-title" className="truncate">
              {title}
            </Heading>
          </div>
          {mode === "delete" && (
            <Span className="flex-shrink-0 px-2.5 py-1 text-xs font-semibold rounded bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
              {tActions("delete")}
            </Span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>

        {/* Footer */}
        {footer && (
          <div
            className={`px-4 sm:px-6 py-4 sm:py-5 border-t ${themed.border} ${themed.bgSecondary} flex-shrink-0`}
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
            className={`fixed z-[60] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md ${themed.bgPrimary} rounded-xl shadow-2xl p-6`}
          >
            <div className={`${flex.rowStart} gap-3 mb-4`}>
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 ${flex.center}`}
              >
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
                <Heading level={4}>{tConfirm("discard")}</Heading>
                <Text variant="secondary" size="sm" className="mt-1">
                  {tConfirm("unsavedChanges")}
                </Text>
              </div>
            </div>
            <div className="flex gap-3 justify-start">
              <Button onClick={cancelClose} variant="secondary" size="sm">
                {tActions("cancel")}
              </Button>
              <Button onClick={confirmClose} variant="danger" size="sm">
                {tActions("discard")}
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
