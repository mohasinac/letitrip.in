/**
 * @fileoverview React Component
 * @module src/components/common/Toast
 * @description This file contains the Toast component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useEffect } from "react";
import { CheckCircle, XCircle, Info, AlertTriangle, X } from "lucide-react";

/**
 * ToastType type
 * 
 * @typedef {Object} ToastType
 * @description Type definition for ToastType
 */
export type ToastType = "success" | "error" | "info" | "warning";

/**
 * ToastProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ToastProps
 */
interface ToastProps {
  /** Message */
  message: string;
  /** Type */
  type?: ToastType;
  /** Duration */
  duration?: number;
  /** On Close */
  onClose: () => void;
  /** Show */
  show: boolean;
}

export default /**
 * Performs toast operation
 *
 * @param {ToastProps} [{
  message,
  type = "info",
  duration = 3000,
  onClose,
  show,
}] - The {
  message,
  type = "info",
  duration = 3000,
  onclose,
  show,
}
 *
 * @returns {any} The toast result
 *
 */
function Toast({
  message,
  type = "info",
  duration = 3000,
  onClose,
  show,
}: ToastProps) {
  useEffect(() => {
    if (show && duration > 0) {
      /**
 * Performs timer operation
 *
 * @param {any} ( - The (
 *
 * @returns {any} The timer result
 *
 */
const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onClose]);

  if (!show) return null;

  const icons = {
    /** Success */
    success: <CheckCircle className="w-5 h-5" />,
    /** Error */
    error: <XCircle className="w-5 h-5" />,
    /** Info */
    info: <Info className="w-5 h-5" />,
    /** Warning */
    warning: <AlertTriangle className="w-5 h-5" />,
  };

  const colors = {
    /** Success */
    success:
      "bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800",
    /** Error */
    error:
      "bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800",
    /** Info */
    info: "bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    /** Warning */
    warning:
      "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  };

  return (
    <div className="fixed top-20 right-4 z-[100] animate-slide-in-right">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border ${colors[type]} min-w-[300px] max-w-md`}
      >
        <div className="flex-shrink-0">{icons[type]}</div>
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition-opacity"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
