"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { UI_LABELS } from "@/constants";

/**
 * Hook to track unsaved changes and warn users before navigating away.
 *
 * Features:
 * - Tracks form dirty state by comparing current vs initial values
 * - Tracks additional dirty flags (e.g. pending avatar upload)
 * - Registers `beforeunload` event to warn on browser/tab close
 * - Provides `confirmLeave()` for programmatic navigation guards
 * - `markClean()` to reset dirty state after a successful save
 *
 * @example
 * ```tsx
 * const { isDirty, markClean, confirmLeave } = useUnsavedChanges({
 *   formValues: { displayName, phoneNumber },
 *   initialValues: initialFormRef.current,
 *   extraDirty: hasAvatarPending,
 * });
 * ```
 */

export interface UseUnsavedChangesOptions {
  /** Current form values to compare against initial */
  formValues: Record<string, string>;
  /** Initial form values snapshot (taken when profile loads) */
  initialValues: Record<string, string> | null;
  /** Additional dirty flag from outside the form (e.g. pending avatar) */
  extraDirty?: boolean;
}

export interface UseUnsavedChangesReturn {
  /** Whether there are any unsaved changes (form or extra) */
  isDirty: boolean;
  /** Whether the form fields specifically have changed */
  isFormDirty: boolean;
  /** Call after a successful save to reset initial values to current */
  markClean: () => void;
  /** Prompt the user and return true if they confirmed leaving, false otherwise */
  confirmLeave: () => boolean;
}

export function useUnsavedChanges({
  formValues,
  initialValues,
  extraDirty = false,
}: UseUnsavedChangesOptions): UseUnsavedChangesReturn {
  const [savedSnapshot, setSavedSnapshot] = useState<Record<
    string,
    string
  > | null>(initialValues);
  const savedSnapshotRef = useRef(savedSnapshot);
  savedSnapshotRef.current = savedSnapshot;

  // Keep savedSnapshot in sync when initialValues first arrives (profile load)
  useEffect(() => {
    if (initialValues && !savedSnapshotRef.current) {
      setSavedSnapshot(initialValues);
    }
  }, [initialValues]);

  // Determine if any form field differs from the saved snapshot
  const isFormDirty = (() => {
    if (!savedSnapshot) return false;
    return Object.keys(formValues).some(
      (key) => (formValues[key] ?? "") !== (savedSnapshot[key] ?? ""),
    );
  })();

  const isDirty = isFormDirty || extraDirty;

  // Register beforeunload handler when dirty
  useEffect(() => {
    if (!isDirty) return;

    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      // Modern browsers ignore custom messages but require returnValue
      e.returnValue = UI_LABELS.CONFIRM.UNSAVED_CHANGES;
      return UI_LABELS.CONFIRM.UNSAVED_CHANGES;
    };

    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  /** Reset the saved snapshot to the current form values (call after save) */
  const markClean = useCallback(() => {
    setSavedSnapshot({ ...formValues });
  }, [formValues]);

  /** Confirm with the user whether they want to leave; returns true if confirmed */
  const confirmLeave = useCallback((): boolean => {
    if (!isDirty) return true;
    return window.confirm(UI_LABELS.CONFIRM.UNSAVED_CHANGES);
  }, [isDirty]);

  return { isDirty, isFormDirty, markClean, confirmLeave };
}
