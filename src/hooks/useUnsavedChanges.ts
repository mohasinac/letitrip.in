"use client";

import { eventBus } from "@/classes";
import {
  useUnsavedChanges as useUnsavedChangesBase,
  UNSAVED_CHANGES_EVENT,
} from "@mohasinac/react";

export { UNSAVED_CHANGES_EVENT };
export type {
  UseUnsavedChangesOptions,
  UseUnsavedChangesReturn,
} from "@mohasinac/react";

/**
 * App-specific wrapper that wires the confirmation flow to the global
 * eventBus — emits UNSAVED_CHANGES_EVENT so the UnsavedChangesModal
 * (subscribed via eventBus) can show an in-app confirmation dialog.
 */
export function useUnsavedChanges(
  opts: Omit<Parameters<typeof useUnsavedChangesBase>[0], "confirmFn">,
) {
  return useUnsavedChangesBase({
    ...opts,
    confirmFn: () =>
      new Promise<boolean>((resolve) => {
        eventBus.emit(UNSAVED_CHANGES_EVENT, resolve);
      }),
  });
}
