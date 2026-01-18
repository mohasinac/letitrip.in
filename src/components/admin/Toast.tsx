"use client";

import {
  ToastContainer as LibraryToastContainer,
  ToastProvider,
  toast as libraryToast,
  useToast,
  useToastGlobalHandler,
  type ToastVariant,
} from "@letitrip/react-library";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";

// Re-export types
export type { ToastVariant };

// Map of icons for toast variants
const icons = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  warning: <AlertTriangle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
};

// Re-export the library toast for direct use
export const toast = libraryToast;

export function ToastContainer() {
  // Connect the global toast handler
  useToastGlobalHandler();

  return <LibraryToastContainer icons={icons} />;
}

// Export ToastProvider for wrapping app
export { ToastProvider };

// Hook for using toast programmatically
export { useToast };
