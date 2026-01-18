
/**
 * useDialogState Hook
 * Framework-agnostic dialog/modal state management
 *
 * Purpose: Centralize dialog state management to avoid multiple useState calls
 * Replaces: useState for showDialog, isOpen, etc. in components with dialogs
 *
 * @example Basic Usage
 * ```tsx
 * const dialog = useDialogState();
 *
 * <button onClick={dialog.open}>Open Dialog</button>
 * <Modal open={dialog.isOpen} onClose={dialog.close}>
 *   Content
 * </Modal>
 * ```
 *
 * @example With Callbacks
 * ```tsx
 * const dialog = useDialogState({
 *   initialOpen: false,
 *   onOpen: () => console.log('Dialog opened'),
 *   onClose: () => console.log('Dialog closed')
 * });
 * ```
 *
 * @example Multiple Dialogs
 * ```tsx
 * const dialogs = useMultipleDialogs(['edit', 'delete', 'confirm']);
 *
 * dialogs.open('edit');
 * dialogs.isOpen('edit'); // true
 * dialogs.isOpen('delete'); // false
 * dialogs.closeAll();
 * ```
 */

import { useCallback, useState } from "react";

export interface DialogStateConfig {
  /** Initial open state (default: false) */
  initialOpen?: boolean;
  /** Called when dialog opens */
  onOpen?: () => void;
  /** Called when dialog closes */
  onClose?: () => void;
}

export interface UseDialogStateReturn {
  /** Whether the dialog is open */
  isOpen: boolean;
  /** Open the dialog */
  open: () => void;
  /** Close the dialog */
  close: () => void;
  /** Toggle dialog open/closed */
  toggle: () => void;
  /** Set dialog open state directly */
  setOpen: (open: boolean) => void;
}

export function useDialogState(
  config?: DialogStateConfig
): UseDialogStateReturn {
  const [isOpen, setIsOpen] = useState(config?.initialOpen ?? false);

  const open = useCallback(() => {
    setIsOpen(true);
    config?.onOpen?.();
  }, [config]);

  const close = useCallback(() => {
    setIsOpen(false);
    config?.onClose?.();
  }, [config]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => {
      const newState = !prev;
      if (newState) {
        config?.onOpen?.();
      } else {
        config?.onClose?.();
      }
      return newState;
    });
  }, [config]);

  const setOpen = useCallback(
    (open: boolean) => {
      if (open) {
        setIsOpen(true);
        config?.onOpen?.();
      } else {
        setIsOpen(false);
        config?.onClose?.();
      }
    },
    [config]
  );

  return {
    isOpen,
    open,
    close,
    toggle,
    setOpen,
  };
}

/**
 * useMultipleDialogs Hook
 * Manages multiple dialogs at once
 *
 * Purpose: Manage multiple dialogs with different states
 *
 * @example
 * ```tsx
 * const dialogs = useMultipleDialogs(['edit', 'delete', 'confirm']);
 *
 * dialogs.open('edit');
 * dialogs.isOpen('edit'); // true
 * dialogs.isOpen('delete'); // false
 * dialogs.toggle('delete');
 * dialogs.closeAll();
 * ```
 */
export interface UseMultipleDialogsReturn {
  /** Check if a specific dialog is open */
  isOpen: (dialogId: string) => boolean;
  /** Open a specific dialog */
  open: (dialogId: string) => void;
  /** Close a specific dialog */
  close: (dialogId: string) => void;
  /** Toggle a specific dialog */
  toggle: (dialogId: string) => void;
  /** Close all dialogs */
  closeAll: () => void;
}

export function useMultipleDialogs(
  dialogIds: string[]
): UseMultipleDialogsReturn {
  const [openDialogs, setOpenDialogs] = useState<Set<string>>(new Set());

  const isOpen = useCallback(
    (dialogId: string) => openDialogs.has(dialogId),
    [openDialogs]
  );

  const open = useCallback((dialogId: string) => {
    setOpenDialogs((prev) => new Set(prev).add(dialogId));
  }, []);

  const close = useCallback((dialogId: string) => {
    setOpenDialogs((prev) => {
      const newSet = new Set(prev);
      newSet.delete(dialogId);
      return newSet;
    });
  }, []);

  const toggle = useCallback((dialogId: string) => {
    setOpenDialogs((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(dialogId)) {
        newSet.delete(dialogId);
      } else {
        newSet.add(dialogId);
      }
      return newSet;
    });
  }, []);

  const closeAll = useCallback(() => {
    setOpenDialogs(new Set());
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
    closeAll,
  };
}
