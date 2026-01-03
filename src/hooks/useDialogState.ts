/**
 * useDialogState Hook
 * Manages dialog/modal visibility and related state
 *
 * Purpose: Centralize dialog state management to avoid multiple useState calls
 * Replaces: useState for showDialog, isOpen, etc. in components with dialogs
 *
 * @example
 * const { isOpen, open, close, toggle } = useDialogState();
 */

import { useCallback, useState } from "react";

export interface DialogStateConfig {
  initialOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export interface UseDialogStateReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
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
 * const dialogs = useMultipleDialogs(['edit', 'delete', 'confirm']);
 * dialogs.open('edit');
 * dialogs.isOpen('delete'); // false
 */

export interface UseMultipleDialogsReturn {
  isOpen: (dialogId: string) => boolean;
  open: (dialogId: string) => void;
  close: (dialogId: string) => void;
  toggle: (dialogId: string) => void;
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
