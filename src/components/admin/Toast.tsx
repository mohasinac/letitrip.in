/**
 * @fileoverview React Component
 * @module src/components/admin/Toast
 * @description This file contains the Toast component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

/**
 * ToastType type
 * 
 * @typedef {Object} ToastType
 * @description Type definition for ToastType
 */
export type ToastType = "success" | "error" | "info" | "warning";

/**
 * Toast interface
 * 
 * @interface
 * @description Defines the structure and contract for Toast
 */
interface Toast {
  /** Id */
  id: string;
  /** Type */
  type: ToastType;
  /** Message */
  message: string;
  /** Duration */
  duration?: number;
}

let toastId = 0;
/**
 * Performs listeners operation
 *
 * @param {Toast[]} toasts - The toasts
 *
 * @returns {any} The listeners result
 *
 */
const listeners = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];

/**
 * Function: Notify
 */
/**
 * Performs notify operation
 *
 * @param {ToastType} type - The type
 * @param {string} message - The message
 * @param {number} [duration] - The duration
 *
 * @returns {string} The notify result
 */

/**
 * Performs notify operation
 *
 * @param {ToastType} type - The type
 * @param {string} message - The message
 * @param {number} [duration] - The duration
 *
 * @returns {string} The notify result
 */

function notify(type: ToastType, message: string, duration = 5000) {
  const id = `toast-${++toastId}`;
  const toast: Toast = { id, type, message, duration };

  toasts = [...toasts, toast];
  listeners.forEach((listener) => listener(toasts));

  if (duration > 0) {
    setTimeout(() => {
      removeToast(id);
    }, duration);
  }
}

/**
 * Function: Remove Toast
 */
/**
 * Deletes toast
 *
 * @param {string} id - Unique identifier
 *
 * @returns {string} The removetoast result
 */

/**
 * Deletes toast
 *
 * @param {string} id - Unique identifier
 *
 * @returns {string} The removetoast result
 */

function /**
 * Performs toast operation
 *
 * @param {string} message - The message
 * @param {number} [duration] - The duration
 *
 * @returns {any} The toast result
 *
 * @example
 * toast("example", 123);
 */
removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  listeners.forEach((listener) => listener(toasts));
}

export const toast = {
  /** Success */
  success: (message: string, duration?: number) =>
    notify("success", message, duration),
  /** Error */
  error: (message: string, duration?: number) =>
    notify("error", message, duration),
  /** Info */
  info: (message: string, duration?: number) =>
    notify("info", message, duration),
  /** Warning */
  warning: (message: string, duration?: number) =>
    notify("warning", message, duration),
};

/**
 * Function: Toast Container
 */
/**
 * Performs toast container operation
 *
 * @returns {any} The toastcontainer result
 *
 * @example
 * ToastContainer();
 */

/**
 * Performs toast container operation
 *
 * @returns {any} The toastcontainer result
 *
 * @example
 * ToastContainer();
 */

export function ToastContainer() {
  const [currentToasts, setCurrentToasts] = useState<Toast[]>([]);

  useEffect(() => {
    listeners.add(setCurrentToasts);
    return () => {
      listeners.delete(setCurrentToasts);
    };
  }, []);

  if (currentToasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-4 z-[100] space-y-2 max-w-md">
      {currentToasts.map((toast) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
}

/**
 * ToastItemProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ToastItemProps
 */
interface ToastItemProps {
  /** Toast */
  toast: Toast;
  /** On Close */
  onClose: () => void;
}

/**
 * Function: Toast Item
 */
/**
 * Performs toast item operation
 *
 * @param {ToastItemProps} { toast, onClose } - The { toast, on close }
 *
 * @returns {any} The toastitem result
 */

/**
 * Performs toast item operation
 *
 * @param {ToastItemProps} { toast, onClose } - The { toast, on close }
 *
 * @returns {any} The toastitem result
 */

function ToastItem({ toast, onClose }: ToastItemProps) {
  const { type, message } = toast;

  const config = {
    /** Success */
    success: {
      /** Icon */
      icon: CheckCircle,
      /** Class Name */
      className:
        "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300",
      /** Icon Color */
      iconColor: "text-green-500 dark:text-green-400",
    },
    /** Error */
    error: {
      /** Icon */
      icon: AlertCircle,
      /** Class Name */
      className:
        "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300",
      /** Icon Color */
      iconColor: "text-red-500 dark:text-red-400",
    },
    /** Warning */
    warning: {
      /** Icon */
      icon: AlertTriangle,
      /** Class Name */
      className:
        "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300",
      /** Icon Color */
      iconColor: "text-yellow-500 dark:text-yellow-400",
    },
    /** Info */
    info: {
      /** Icon */
      icon: Info,
      /** Class Name */
      className:
        "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300",
      /** Icon Color */
      iconColor: "text-blue-500 dark:text-blue-400",
    },
  };

  const { icon: Icon, className, iconColor } = config[type];

  return (
    <div
      className={`flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-slide-in ${className}`}
    >
      <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColor}`} />
      <p className="flex-1 text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
