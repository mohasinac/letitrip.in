/**
 * useFormWithDraft Hook
 *
 * Manages form state with auto-save draft functionality.
 * Saves drafts to localStorage and restores on mount.
 *
 * @example
 * ```tsx
 * const {
 *   values,
 *   setValue,
 *   setValues,
 *   reset,
 *   hasDraft,
 *   clearDraft,
 *   isDirty,
 *   lastSaved
 * } = useFormWithDraft({
 *   key: 'product-form',
 *   initialValues: { name: '', price: 0 },
 *   autoSaveDelay: 2000
 * });
 * ```
 */

import { logError } from "@/lib/firebase-error-logger";
import { useCallback, useEffect, useRef, useState } from "react";

export interface UseFormWithDraftOptions<T> {
  /** Unique key for localStorage (required) */
  key: string;
  /** Initial form values */
  initialValues: T;
  /** Auto-save delay in ms (default: 2000) */
  autoSaveDelay?: number;
  /** Enable auto-save (default: true) */
  autoSave?: boolean;
  /** Callback when draft is saved */
  onDraftSaved?: (values: T) => void;
  /** Callback when draft is loaded */
  onDraftLoaded?: (values: T) => void;
  /** Callback when draft is cleared */
  onDraftCleared?: () => void;
}

export interface UseFormWithDraftReturn<T> {
  /** Current form values */
  values: T;
  /** Set a single field value */
  setValue: <K extends keyof T>(key: K, value: T[K]) => void;
  /** Set multiple values */
  setValues: (values: Partial<T>) => void;
  /** Reset to initial values */
  reset: () => void;
  /** Whether a draft exists in storage */
  hasDraft: boolean;
  /** Clear draft from storage */
  clearDraft: () => void;
  /** Whether form has unsaved changes */
  isDirty: boolean;
  /** Last saved timestamp */
  lastSaved: Date | null;
  /** Manually save draft */
  saveDraft: () => void;
  /** Load draft from storage */
  loadDraft: () => void;
}

const STORAGE_PREFIX = "form-draft:";

export function useFormWithDraft<T extends Record<string, any>>({
  key,
  initialValues,
  autoSaveDelay = 2000,
  autoSave = true,
  onDraftSaved,
  onDraftLoaded,
  onDraftCleared,
}: UseFormWithDraftOptions<T>): UseFormWithDraftReturn<T> {
  const storageKey = `${STORAGE_PREFIX}${key}`;
  const [values, setValuesState] = useState<T>(initialValues);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasDraft, setHasDraft] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialValuesRef = useRef(initialValues);

  // Check if draft exists in storage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      setHasDraft(!!stored);
    } catch (error) {
      logError(error as Error, {
        component: "useFormWithDraft.checkDraft",
        metadata: { key },
      });
    }
  }, [storageKey, key]);

  // Load draft on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setValuesState(parsed.values);
        setLastSaved(new Date(parsed.timestamp));
        setIsDirty(true);
        onDraftLoaded?.(parsed.values);
      }
    } catch (error) {
      logError(error as Error, {
        component: "useFormWithDraft.loadDraft",
        metadata: { key },
      });
    }
  }, [storageKey, key, onDraftLoaded]);

  // Save draft to storage
  const saveDraft = useCallback(() => {
    try {
      const draft = {
        values,
        timestamp: new Date().toISOString(),
      };
      localStorage.setItem(storageKey, JSON.stringify(draft));
      setLastSaved(new Date());
      setHasDraft(true);
      onDraftSaved?.(values);
    } catch (error) {
      logError(error as Error, {
        component: "useFormWithDraft.saveDraft",
        metadata: { key },
      });
    }
  }, [values, storageKey, key, onDraftSaved]);

  // Load draft from storage
  const loadDraft = useCallback(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        setValuesState(parsed.values);
        setLastSaved(new Date(parsed.timestamp));
        setIsDirty(true);
        onDraftLoaded?.(parsed.values);
      }
    } catch (error) {
      logError(error as Error, {
        component: "useFormWithDraft.loadDraft",
        metadata: { key },
      });
    }
  }, [storageKey, key, onDraftLoaded]);

  // Clear draft from storage
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      setHasDraft(false);
      setLastSaved(null);
      onDraftCleared?.();
    } catch (error) {
      logError(error as Error, {
        component: "useFormWithDraft.clearDraft",
        metadata: { key },
      });
    }
  }, [storageKey, key, onDraftCleared]);

  // Auto-save when values change
  useEffect(() => {
    if (!autoSave) return;

    // Clear existing timer
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // Set new timer
    autoSaveTimerRef.current = setTimeout(() => {
      if (isDirty) {
        saveDraft();
      }
    }, autoSaveDelay);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [values, isDirty, autoSave, autoSaveDelay, saveDraft]);

  // Set a single field value
  const setValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setValuesState((prev) => ({ ...prev, [key]: value }));
    setIsDirty(true);
  }, []);

  // Set multiple values
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState((prev) => ({ ...prev, ...newValues }));
    setIsDirty(true);
  }, []);

  // Reset to initial values
  const reset = useCallback(() => {
    setValuesState(initialValuesRef.current);
    setIsDirty(false);
    clearDraft();
  }, [clearDraft]);

  return {
    values,
    setValue,
    setValues,
    reset,
    hasDraft,
    clearDraft,
    isDirty,
    lastSaved,
    saveDraft,
    loadDraft,
  };
}

export default useFormWithDraft;
