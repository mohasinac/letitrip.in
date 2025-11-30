/**
 * Error state component with retry functionality
 */

import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
  type?: "error" | "not-found" | "network";
  className?: string;
}

export default function ErrorState({
  message = "Something went wrong",
  onRetry,
  type = "error",
  className = "",
}: ErrorStateProps) {
  const getMessage = () => {
    if (message !== "Something went wrong") return message;

    switch (type) {
      case "not-found":
        return "The item you're looking for doesn't exist";
      case "network":
        return "Network error. Please check your connection";
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
