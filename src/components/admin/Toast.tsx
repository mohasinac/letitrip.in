"use client";

import {
  ToastContainer as LibraryToastContainer,
  ToastItem as LibraryToastItem,
  useToastManager,
  type Toast,
  type ToastType,
} from "@letitrip/react-library";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";

// Re-export types
export type { ToastType };

// Global toast manager instance
let globalToastManager: ReturnType<typeof useToastManager> | null = null;

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  close: X,
};

export const toast = {
  success: (message: string, duration?: number) => {
    globalToastManager?.addToast("success", message, duration);
  },
  error: (message: string, duration?: number) => {
    globalToastManager?.addToast("error", message, duration);
  },
  info: (message: string, duration?: number) => {
    globalToastManager?.addToast("info", message, duration);
  },
  warning: (message: string, duration?: number) => {
    globalToastManager?.addToast("warning", message, duration);
  },
  // For testing: clear all toasts
  __clearAll: () => {
    globalToastManager?.clearAll();
  },
};

export function ToastContainer() {
  // Initialize global manager
  const toastManager = useToastManager();
  globalToastManager = toastManager;

  return (
    <LibraryToastContainer
      toasts={toastManager.toasts}
      onRemove={toastManager.removeToast}
      icons={icons}
    />
  );
}

export function ToastItem({
  toast,
  onClose,
}: {
  toast: Toast;
  onClose: () => void;
}) {
  return <LibraryToastItem toast={toast} onClose={onClose} icons={icons} />;
}
