/**
 * @fileoverview React Component
 * @module src/components/common/ErrorState
 * @description This file contains the ErrorState component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

/**
 * Error state component with retry functionality
 */

import { AlertTriangle, RefreshCw } from "lucide-react";

/**
 * ErrorStateProps interface
 * 
 * @interface
 * @description Defines the structure and contract for ErrorStateProps
 */
interface ErrorStateProps {
  /** Message */
  message?: string;
  /** On Retry */
  onRetry?: () => void;
  /** Type */
  type?: "error" | "not-found" | "network";
  /** Class Name */
  className?: string;
}

export default /**
 * Performs error state operation
 *
 * @param {ErrorStateProps} [{
  message = "Something went wrong",
  onRetry,
  type = "error",
  className = "",
}] - The {
  message = "something went wrong",
  onretry,
  type = "error",
  classname = "",
}
 *
 * @returns {any} The errorstate result
 *
 */
function ErrorState({
  message = "Something went wrong",
  onRetry,
  type = "error",
  className = "",
}: ErrorStateProps) {
  /**
   * Retrieves message
   *
   * @returns {any} The message result
   */

  /**
   * Retrieves message
   *
   * @returns {any} The message result
   */

  const getMessage = () => {
    if (message !== "Something went wrong") return message;

    switch (type) {
      case "not-found":
        return "The item you're looking for doesn't exist";
      case "network":
        return "Network error. Please check your connection";
      /** Default */
      default:
        return "Something went wrong. Please try again";
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
        </div>

        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          {type === "not-found" ? "Not Found" : "Error"}
        </h3>

        <p className="text-gray-600 dark:text-gray-400 mb-6">{getMessage()}</p>

        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}
