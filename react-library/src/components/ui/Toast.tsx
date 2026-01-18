
/**
 * Toast Notification System
 *
 * Framework-agnostic toast notification component with queue management.
 * Supports multiple variants, auto-dismiss, and positioning.
 *
 * @example
 * ```tsx
 * import { ToastProvider, useToast, ToastContainer } from './Toast';
 *
 * // Wrap your app with ToastProvider
 * function App() {
 *   return (
 *     <ToastProvider>
 *       <YourApp />
 *       <ToastContainer />
 *     </ToastProvider>
 *   );
 * }
 *
 * // Use in components
 * function MyComponent() {
 *   const toast = useToast();
 *
 *   return (
 *     <button onClick={() => toast.success('Action completed!')}>
 *       Show Toast
 *     </button>
 *   );
 * }
 * ```
 */

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ToastVariant = "success" | "error" | "warning" | "info";
export type ToastPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

export interface Toast {
  id: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  success: (message: string, duration?: number) => void;
  error: (message: string, duration?: number) => void;
  warning: (message: string, duration?: number) => void;
  info: (message: string, duration?: number) => void;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export interface ToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export function ToastProvider({ children, maxToasts = 5 }: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = `toast-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const newToast: Toast = { ...toast, id };

      setToasts((prev) => {
        const updated = [...prev, newToast];
        return updated.slice(-maxToasts);
      });

      // Auto-dismiss if duration is set
      if (toast.duration !== 0) {
        const duration = toast.duration || 5000;
        setTimeout(() => {
          setToasts((prev) => prev.filter((t) => t.id !== id));
        }, duration);
      }
    },
    [maxToasts]
  );

  const success = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, variant: "success", duration });
    },
    [showToast]
  );

  const error = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, variant: "error", duration });
    },
    [showToast]
  );

  const warning = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, variant: "warning", duration });
    },
    [showToast]
  );

  const info = useCallback(
    (message: string, duration?: number) => {
      showToast({ message, variant: "info", duration });
    },
    [showToast]
  );

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => {
    setToasts([]);
  }, []);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        showToast,
        success,
        error,
        warning,
        info,
        dismiss,
        dismissAll,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}

// Toast Item Component
interface ToastItemProps {
  toast: Toast;
  onDismiss: (id: string) => void;
  icons?: Record<ToastVariant, ReactNode>;
}

function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default icons
const defaultIcons = {
  success: (
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
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  error: (
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
        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
  warning: (
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
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
  ),
  info: (
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
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  ),
};

const closeIcon = (
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
);

function ToastItem({ toast, onDismiss, icons = defaultIcons }: ToastItemProps) {
  const [isExiting, setIsExiting] = useState(false);

  const handleDismiss = () => {
    setIsExiting(true);
    setTimeout(() => onDismiss(toast.id), 300);
  };

  const variantStyles = {
    success:
      "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    error:
      "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200",
    warning:
      "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
    info: "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
  };

  return (
    <div
      className={cn(
        "flex items-start gap-3 p-4 rounded-lg border shadow-lg mb-2 min-w-[320px] max-w-md",
        "transition-all duration-300 ease-in-out",
        isExiting ? "opacity-0 translate-x-full" : "opacity-100 translate-x-0",
        variantStyles[toast.variant]
      )}
      role="alert"
      aria-live="polite"
    >
      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">{icons[toast.variant]}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium break-words">{toast.message}</p>
        {toast.action && (
          <button
            onClick={toast.action.onClick}
            className="mt-2 text-sm font-semibold underline hover:no-underline"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close button */}
      <button
        onClick={handleDismiss}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
        aria-label="Dismiss notification"
      >
        {closeIcon}
      </button>
    </div>
  );
}

// Toast Container Component
export interface ToastContainerProps {
  position?: ToastPosition;
  icons?: Record<ToastVariant, ReactNode>;
}

export function ToastContainer({
  position = "top-right",
  icons = defaultIcons,
}: ToastContainerProps) {
  const { toasts, dismiss } = useToast();

  const positionStyles = {
    "top-left": "top-4 left-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "top-right": "top-4 right-4",
    "bottom-left": "bottom-4 left-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
    "bottom-right": "bottom-4 right-4",
  };

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className={cn("fixed z-50 pointer-events-none", positionStyles[position])}
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="pointer-events-auto space-y-2">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={dismiss}
            icons={icons}
          />
        ))}
      </div>
    </div>
  );
}

// Imperative API (for use outside React components)
let globalShowToast: ((toast: Omit<Toast, "id">) => void) | null = null;

export function setGlobalToastHandler(
  handler: ((toast: Omit<Toast, "id">) => void) | null
) {
  globalShowToast = handler;
}

export const toast = {
  success: (message: string, duration?: number) => {
    globalShowToast?.({ message, variant: "success", duration });
  },
  error: (message: string, duration?: number) => {
    globalShowToast?.({ message, variant: "error", duration });
  },
  warning: (message: string, duration?: number) => {
    globalShowToast?.({ message, variant: "warning", duration });
  },
  info: (message: string, duration?: number) => {
    globalShowToast?.({ message, variant: "info", duration });
  },
};

// Hook to set up global handler
export function useToastGlobalHandler() {
  const { showToast } = useToast();

  useEffect(() => {
    setGlobalToastHandler(showToast);
    return () => setGlobalToastHandler(null);
  }, [showToast]);
}

export default {
  ToastProvider,
  ToastContainer,
  useToast,
  useToastGlobalHandler,
  toast,
};
