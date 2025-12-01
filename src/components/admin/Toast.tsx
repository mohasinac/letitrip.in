"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from "lucide-react";

export type ToastType = "success" | "error" | "info" | "warning";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

let toastId = 0;
const listeners = new Set<(toasts: Toast[]) => void>();
let toasts: Toast[] = [];

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

function removeToast(id: string) {
  toasts = toasts.filter((t) => t.id !== id);
  listeners.forEach((listener) => listener(toasts));
}

export const toast = {
  success: (message: string, duration?: number) =>
    notify("success", message, duration),
  error: (message: string, duration?: number) =>
    notify("error", message, duration),
  info: (message: string, duration?: number) =>
    notify("info", message, duration),
  warning: (message: string, duration?: number) =>
    notify("warning", message, duration),
};

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

interface ToastItemProps {
  toast: Toast;
  onClose: () => void;
}

function ToastItem({ toast, onClose }: ToastItemProps) {
  const { type, message } = toast;

  const config = {
    success: {
      icon: CheckCircle,
      className:
        "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-300",
      iconColor: "text-green-500 dark:text-green-400",
    },
    error: {
      icon: AlertCircle,
      className:
        "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-300",
      iconColor: "text-red-500 dark:text-red-400",
    },
    warning: {
      icon: AlertTriangle,
      className:
        "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-300",
      iconColor: "text-yellow-500 dark:text-yellow-400",
    },
    info: {
      icon: Info,
      className:
        "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300",
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
