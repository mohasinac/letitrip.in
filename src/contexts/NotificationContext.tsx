"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

/**
 * Toast notification types
 */
export type ToastType = "success" | "error" | "warning" | "info";

/**
 * Toast notification interface
 */
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Notification context interface
 */
interface NotificationContextType {
  /**
   * List of active toast notifications
   */
  toasts: Toast[];

  /**
   * Show a success toast notification
   * @param message Toast message
   * @param options Optional configuration
   */
  showSuccess: (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>
  ) => string;

  /**
   * Show an error toast notification
   * @param message Toast message
   * @param options Optional configuration
   */
  showError: (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>
  ) => string;

  /**
   * Show a warning toast notification
   * @param message Toast message
   * @param options Optional configuration
   */
  showWarning: (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>
  ) => string;

  /**
   * Show an info toast notification
   * @param message Toast message
   * @param options Optional configuration
   */
  showInfo: (
    message: string,
    options?: Partial<Omit<Toast, "id" | "type" | "message">>
  ) => string;

  /**
   * Show a custom toast notification
   * @param toast Toast configuration
   */
  showToast: (toast: Omit<Toast, "id">) => string;

  /**
   * Dismiss a specific toast by ID
   * @param id Toast ID to dismiss
   */
  dismiss: (id: string) => void;

  /**
   * Dismiss all active toasts
   */
  dismissAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

/**
 * Default toast duration in milliseconds
 */
const DEFAULT_DURATION = 5000;

/**
 * NotificationProvider manages toast notifications in the application.
 *
 * Features:
 * - Multiple toast types (success, error, warning, info)
 * - Auto-dismiss with configurable duration
 * - Manual dismiss
 * - Optional action buttons
 * - Toast stacking
 *
 * @example
 * ```tsx
 * // In app layout
 * <NotificationProvider>
 *   <App />
 * </NotificationProvider>
 * ```
 *
 * @example
 * ```tsx
 * // In a component
 * function MyComponent() {
 *   const { showSuccess, showError } = useNotification();
 *
 *   const handleSave = async () => {
 *     try {
 *       await saveData();
 *       showSuccess('Data saved successfully!');
 *     } catch (error) {
 *       showError('Failed to save data');
 *     }
 *   };
 * }
 * ```
 */
export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  /**
   * Generate a unique toast ID
   */
  const generateId = useCallback(() => {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  /**
   * Show a toast notification
   */
  const showToast = useCallback(
    (toast: Omit<Toast, "id">): string => {
      const id = generateId();
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? DEFAULT_DURATION,
      };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    [generateId]
  );

  /**
   * Show a success toast
   */
  const showSuccess = useCallback(
    (
      message: string,
      options?: Partial<Omit<Toast, "id" | "type" | "message">>
    ): string => {
      return showToast({
        type: "success",
        message,
        ...options,
      });
    },
    [showToast]
  );

  /**
   * Show an error toast
   */
  const showError = useCallback(
    (
      message: string,
      options?: Partial<Omit<Toast, "id" | "type" | "message">>
    ): string => {
      return showToast({
        type: "error",
        message,
        ...options,
      });
    },
    [showToast]
  );

  /**
   * Show a warning toast
   */
  const showWarning = useCallback(
    (
      message: string,
      options?: Partial<Omit<Toast, "id" | "type" | "message">>
    ): string => {
      return showToast({
        type: "warning",
        message,
        ...options,
      });
    },
    [showToast]
  );

  /**
   * Show an info toast
   */
  const showInfo = useCallback(
    (
      message: string,
      options?: Partial<Omit<Toast, "id" | "type" | "message">>
    ): string => {
      return showToast({
        type: "info",
        message,
        ...options,
      });
    },
    [showToast]
  );

  /**
   * Dismiss a specific toast
   */
  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  /**
   * Dismiss all toasts
   */
  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  /**
   * Auto-dismiss toasts after their duration
   */
  useEffect(() => {
    if (toasts.length === 0) return;

    const timers: NodeJS.Timeout[] = [];

    toasts.forEach((toast) => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          dismiss(toast.id);
        }, toast.duration);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [toasts, dismiss]);

  const value: NotificationContextType = {
    toasts,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showToast,
    dismiss,
    dismissAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to access notification context
 *
 * @throws {Error} If used outside of NotificationProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { showSuccess, showError } = useNotification();
 *
 *   return (
 *     <button onClick={() => showSuccess('Action completed!')}>
 *       Click me
 *     </button>
 *   );
 * }
 * ```
 */
export function useNotification(): NotificationContextType {
  const context = useContext(NotificationContext);

  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider. " +
        "Make sure your component is wrapped with <NotificationProvider>."
    );
  }

  return context;
}
