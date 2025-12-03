import { AlertCircle, RefreshCw, Home, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface ErrorMessageProps {
  title?: string;
  message: string;
  error?: Error | null;
  showRetry?: boolean;
  showGoHome?: boolean;
  showGoBack?: boolean;
  onRetry?: () => void;
  onGoHome?: () => void;
  onGoBack?: () => void;
  className?: string;
}

/**
 * User-friendly error message component with actions
 *
 * @example
 * // Simple error
 * <ErrorMessage message="Failed to load products" />
 *
 * // With retry
 * <ErrorMessage
 *   message="Connection issue"
 *   showRetry
 *   onRetry={() => refetch()}
 * />
 *
 * // With navigation options
 * <ErrorMessage
 *   title="Page Not Found"
 *   message="The page you're looking for doesn't exist."
 *   showGoHome
 *   showGoBack
 * />
 */
export function ErrorMessage({
  title = "Oops! Something went wrong",
  message,
  error,
  showRetry = false,
  showGoHome = false,
  showGoBack = false,
  onRetry,
  onGoHome,
  onGoBack,
  className,
}: ErrorMessageProps) {
  // In development, show technical error for debugging
  const isDevelopment = process.env.NODE_ENV === "development";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 text-center",
        className,
      )}
    >
      {/* Error Icon */}
      <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 rounded-full">
        <AlertCircle className="h-12 w-12 text-red-500 dark:text-red-400" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {title}
      </h3>

      {/* User-friendly message */}
      <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        {message}
      </p>

      {/* Technical error (development only) */}
      {isDevelopment && error && (
        <details className="mb-6 w-full max-w-2xl">
          <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            Show technical details
          </summary>
          <div className="mt-2 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg text-left">
            <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
              {error.message}
            </p>
            {error.stack && (
              <pre className="mt-2 text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-40">
                {error.stack}
              </pre>
            )}
          </div>
        </details>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        {showRetry && onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        )}

        {showGoHome && (
          <button
            onClick={
              onGoHome ||
              (() => {
                if (globalThis.location) globalThis.location.href = "/";
              })
            }
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <Home className="h-4 w-4" />
            Go Home
          </button>
        )}

        {showGoBack && (
          <button
            onClick={onGoBack || (() => globalThis.history?.back())}
            className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Convert technical errors to user-friendly messages
 */
export function getUserFriendlyError(error: any): string {
  if (!error) return "Something went wrong. Please try again.";

  const message = error.message || error.toString();

  // Common Firebase errors
  if (message.includes("permission-denied")) {
    return "You don't have permission to access this. Please sign in or contact support.";
  }
  if (message.includes("not-found")) {
    return "We couldn't find what you're looking for. It may have been removed or doesn't exist.";
  }
  if (message.includes("already-exists")) {
    return "This item already exists. Please try a different name or check existing items.";
  }
  if (message.includes("unauthenticated")) {
    return "Please sign in to continue.";
  }

  // Network errors
  if (message.includes("network") || message.includes("fetch")) {
    return "Connection issue. Please check your internet connection and try again.";
  }
  if (message.includes("timeout")) {
    return "Request timed out. Please try again.";
  }

  // Validation errors
  if (message.includes("invalid")) {
    return "Invalid input. Please check your information and try again.";
  }
  if (message.includes("required")) {
    return "Please fill in all required fields.";
  }

  // Payment errors
  if (message.includes("payment")) {
    return "Payment failed. Please check your payment details and try again.";
  }

  // Default fallback
  return "Something went wrong. Please try again or contact support if the problem persists.";
}

/**
 * Compact inline error message
 */
export function InlineError({
  message,
  className,
}: {
  message: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400",
        className,
      )}
    >
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <p>{message}</p>
    </div>
  );
}
