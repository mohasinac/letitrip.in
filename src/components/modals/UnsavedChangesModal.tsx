"use client";

import { useEffect, useState } from "react";
import { Button, Card } from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import { eventBus } from "@/classes";
import { UNSAVED_CHANGES_EVENT } from "@/hooks";

type UnsavedChangesResolve = (confirmed: boolean) => void;

/**
 * UnsavedChangesModal
 *
 * Listens on the eventBus for "unsaved-changes:confirm" events.
 * When triggered by `useUnsavedChanges.confirmLeave()`, shows a confirmation
 * modal and resolves the caller's Promise<boolean>.
 *
 * Mount once in LayoutClient — never instantiate per-page.
 */
export default function UnsavedChangesModal() {
  const t = useTranslations("unsavedChanges");
  const [isOpen, setIsOpen] = useState(false);
  const [resolve, setResolve] = useState<UnsavedChangesResolve | null>(null);

  useEffect(() => {
    const subscription = eventBus.on(
      UNSAVED_CHANGES_EVENT,
      (resolveFn: UnsavedChangesResolve) => {
        setResolve(() => resolveFn);
        setIsOpen(true);
      },
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleCancel();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  function handleConfirm() {
    setIsOpen(false);
    resolve?.(true);
    setResolve(null);
  }

  function handleCancel() {
    setIsOpen(false);
    resolve?.(false);
    setResolve(null);
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleCancel}
    >
      <div onClick={(e: React.MouseEvent) => e.stopPropagation()}>
        <Card
          className={`w-full max-w-md ${THEME_CONSTANTS.themed.bgPrimary} ${THEME_CONSTANTS.spacing.padding.lg}`}
        >
          <h2
            className={`${THEME_CONSTANTS.typography.h4} ${THEME_CONSTANTS.themed.textPrimary} mb-2`}
          >
            {t("title")}
          </h2>
          <p
            className={`${THEME_CONSTANTS.typography.small} ${THEME_CONSTANTS.themed.textSecondary} mb-6`}
          >
            {t("message")}
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={handleCancel}>
              {t("stay")}
            </Button>
            <Button variant="danger" onClick={handleConfirm}>
              {t("leave")}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
