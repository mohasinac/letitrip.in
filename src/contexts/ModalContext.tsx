"use client";

import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

/**
 * Modal configuration interface
 */
export interface Modal {
  id: string;
  component: ReactNode;
  onClose?: () => void;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
}

/**
 * Modal result type for promise-based API
 */
export type ModalResult<T = unknown> = {
  confirmed: boolean;
  data?: T;
};

/**
 * Modal context interface
 */
interface ModalContextType {
  /**
   * Stack of currently open modals
   */
  modals: Modal[];

  /**
   * Open a modal with promise-based API
   * @param component Modal component to display
   * @param options Modal configuration options
   * @returns Promise that resolves when modal is closed with result
   *
   * @example
   * ```tsx
   * const result = await openModal(<ConfirmDialog />, {
   *   closeOnBackdropClick: false
   * });
   * if (result.confirmed) {
   *   // User confirmed
   * }
   * ```
   */
  openModal: <T = unknown>(
    component: ReactNode,
    options?: {
      closeOnBackdropClick?: boolean;
      closeOnEscape?: boolean;
      onClose?: () => void;
    }
  ) => Promise<ModalResult<T>>;

  /**
   * Close a specific modal by ID
   * @param id Modal ID to close
   * @param result Optional result to pass to promise
   */
  closeModal: (id: string, result?: ModalResult) => void;

  /**
   * Close all open modals
   */
  closeAll: () => void;

  /**
   * Get the top-most (active) modal
   */
  getActiveModal: () => Modal | null;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

/**
 * Internal type for tracking modal promises
 */
interface ModalPromise {
  id: string;
  resolve: (result: ModalResult) => void;
}

/**
 * ModalProvider manages a stack of modals with promise-based API.
 *
 * Features:
 * - Modal stacking (multiple modals can be open)
 * - Promise-based API (await modal results)
 * - Configurable close behavior (backdrop click, escape key)
 * - Nested modal support
 * - Automatic cleanup
 *
 * @example
 * ```tsx
 * // In app layout
 * <ModalProvider>
 *   <App />
 * </ModalProvider>
 * ```
 *
 * @example
 * ```tsx
 * // In a component
 * function MyComponent() {
 *   const { openModal } = useModal();
 *
 *   const handleDelete = async () => {
 *     const result = await openModal(
 *       <ConfirmDialog
 *         title="Delete Item"
 *         message="Are you sure?"
 *       />
 *     );
 *
 *     if (result.confirmed) {
 *       await deleteItem();
 *     }
 *   };
 * }
 * ```
 */
export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = useState<Modal[]>([]);
  const [promises, setPromises] = useState<ModalPromise[]>([]);

  /**
   * Generate a unique modal ID
   */
  const generateId = useCallback(() => {
    return `modal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Open a modal and return a promise
   */
  const openModal = useCallback(
    <T = unknown,>(
      component: ReactNode,
      options?: {
        closeOnBackdropClick?: boolean;
        closeOnEscape?: boolean;
        onClose?: () => void;
      }
    ): Promise<ModalResult<T>> => {
      return new Promise<ModalResult<T>>((resolve) => {
        const id = generateId();

        const modal: Modal = {
          id,
          component,
          closeOnBackdropClick: options?.closeOnBackdropClick ?? true,
          closeOnEscape: options?.closeOnEscape ?? true,
          onClose: options?.onClose,
        };

        // Add modal to stack
        setModals((prev) => [...prev, modal]);

        // Store promise resolver
        setPromises((prev) => [
          ...prev,
          {
            id,
            resolve: resolve as (result: ModalResult) => void,
          },
        ]);
      });
    },
    [generateId]
  );

  /**
   * Close a specific modal
   */
  const closeModal = useCallback(
    (id: string, result: ModalResult = { confirmed: false }) => {
      // Find and resolve the promise
      setPromises((prev) => {
        const promiseEntry = prev.find((p) => p.id === id);
        if (promiseEntry) {
          promiseEntry.resolve(result);
        }
        return prev.filter((p) => p.id !== id);
      });

      // Remove modal from stack
      setModals((prev) => {
        const modal = prev.find((m) => m.id === id);
        if (modal?.onClose) {
          modal.onClose();
        }
        return prev.filter((m) => m.id !== id);
      });
    },
    []
  );

  /**
   * Close all modals
   */
  const closeAll = useCallback(() => {
    // Resolve all promises with cancelled result
    promises.forEach((p) => {
      p.resolve({ confirmed: false });
    });

    // Call onClose for each modal
    modals.forEach((modal) => {
      if (modal.onClose) {
        modal.onClose();
      }
    });

    setPromises([]);
    setModals([]);
  }, [modals, promises]);

  /**
   * Get the active (top-most) modal
   */
  const getActiveModal = useCallback((): Modal | null => {
    if (modals.length === 0) return null;
    return modals[modals.length - 1];
  }, [modals]);

  /**
   * Handle escape key press
   */
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        const activeModal = modals[modals.length - 1];
        if (activeModal && activeModal.closeOnEscape) {
          closeModal(activeModal.id);
        }
      }
    };

    if (modals.length > 0) {
      window.addEventListener("keydown", handleEscape);
      return () => window.removeEventListener("keydown", handleEscape);
    }
  }, [modals, closeModal]);

  const value: ModalContextType = {
    modals,
    openModal,
    closeModal,
    closeAll,
    getActiveModal,
  };

  return (
    <ModalContext.Provider value={value}>{children}</ModalContext.Provider>
  );
}

/**
 * Hook to access modal context
 *
 * @throws {Error} If used outside of ModalProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { openModal, closeModal } = useModal();
 *
 *   const handleConfirm = async () => {
 *     const result = await openModal(
 *       <ConfirmDialog
 *         onConfirm={() => closeModal(modalId, { confirmed: true })}
 *         onCancel={() => closeModal(modalId, { confirmed: false })}
 *       />
 *     );
 *
 *     if (result.confirmed) {
 *       console.log('User confirmed!');
 *     }
 *   };
 * }
 * ```
 */
export function useModal(): ModalContextType {
  const context = useContext(ModalContext);

  if (context === undefined) {
    throw new Error(
      "useModal must be used within a ModalProvider. " +
        "Make sure your component is wrapped with <ModalProvider>."
    );
  }

  return context;
}
