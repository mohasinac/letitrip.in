/**
 * ErrorMessage Component
 *
 * User-friendly error message display with action buttons.
 * Shows technical details in development mode.
 *
 * @example
 * ```tsx
 * <ErrorMessage
 *   title="Failed to load data"
 *   message="Unable to fetch products. Please try again."
 *   error={errorObject}
 *   onRetry={handleRetry}
 *   onGoHome={() => router.push('/')}
 * />
 * ```
 */

import React from "react";

export interface ErrorMessageProps {
  /** Error title */
  title?: string;
  /** User-friendly error message */
  message?: string;
  /** Error object (for dev mode details) */
  error?: Error;
  /** Retry callback */
  onRetry?: () => void;
  /** Go home callback */
  onGoHome?: () => void;
  /** Go back callback */
  onGoBack?: () => void;
  /** Show technical details (defaults to process.env.NODE_ENV === 'development') */
  showDetails?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom AlertCircle icon */
  AlertCircleIcon?: React.ComponentType<{ className?: string }>;
  /** Custom RefreshCw icon */
  RefreshIcon?: React.ComponentType<{ className?: string }>;
  /** Custom Home icon */
  HomeIcon?: React.ComponentType<{ className?: string }>;
  /** Custom ArrowLeft icon */
  ArrowLeftIcon?: React.ComponentType<{ className?: string }>;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default inline SVG icons
function DefaultAlertCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function DefaultRefreshIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function DefaultHomeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function DefaultArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="19" y1="12" x2="5" y2="12" />
      <polyline points="12 19 5 12 12 5" />
    </svg>
  );
}

export function ErrorMessage({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  error,
  onRetry,
  onGoHome,
  onGoBack,
  showDetails,
  className = "",
  AlertCircleIcon = DefaultAlertCircleIcon,
  RefreshIcon = DefaultRefreshIcon,
  HomeIcon = DefaultHomeIcon,
  ArrowLeftIcon = DefaultArrowLeftIcon,
}: ErrorMessageProps) {
  const isDev = showDetails ?? process.env.NODE_ENV === "development";

  return (
    <div
      className={cn(
        "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800",
        "rounded-lg p-6 max-w-2xl mx-auto",
        className
      )}
    >
      {/* Header with icon */}
      <div className="flex items-start gap-3 mb-4">
        <AlertCircleIcon className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-1">
            {title}
          </h3>
          <p className="text-sm text-red-700 dark:text-red-300">{message}</p>
        </div>
      </div>

      {/* Action buttons */}
      {(onRetry || onGoHome || onGoBack) && (
        <div className="flex flex-wrap gap-3 mt-4">
          {onRetry && (
            <button
              onClick={onRetry}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2",
                "text-sm font-medium rounded-lg",
                "bg-red-600 hover:bg-red-700 text-white",
                "transition-colors focus:outline-none focus:ring-2",
                "focus:ring-red-500 focus:ring-offset-2"
              )}
            >
              <RefreshIcon className="w-4 h-4" />
              Retry
            </button>
          )}
          {onGoHome && (
            <button
              onClick={onGoHome}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2",
                "text-sm font-medium rounded-lg",
                "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                "border border-gray-300 dark:border-gray-600",
                "hover:bg-gray-50 dark:hover:bg-gray-700",
                "transition-colors"
              )}
            >
              <HomeIcon className="w-4 h-4" />
              Go Home
            </button>
          )}
          {onGoBack && (
            <button
              onClick={onGoBack}
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2",
                "text-sm font-medium rounded-lg",
                "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300",
                "border border-gray-300 dark:border-gray-600",
                "hover:bg-gray-50 dark:hover:bg-gray-700",
                "transition-colors"
              )}
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Go Back
            </button>
          )}
        </div>
      )}

      {/* Technical details (dev mode) */}
      {isDev && error && (
        <details className="mt-4">
          <summary className="text-sm font-medium text-red-800 dark:text-red-200 cursor-pointer hover:underline">
            Technical Details
          </summary>
          <div className="mt-2 p-3 bg-red-100 dark:bg-red-900/40 rounded border border-red-200 dark:border-red-800">
            {error.message && (
              <div className="mb-2">
                <span className="text-xs font-semibold text-red-900 dark:text-red-100">
                  Message:
                </span>
                <p className="text-xs text-red-800 dark:text-red-200 font-mono">
                  {error.message}
                </p>
              </div>
            )}
            {error.stack && (
              <div>
                <span className="text-xs font-semibold text-red-900 dark:text-red-100">
                  Stack Trace:
                </span>
                <pre className="text-xs text-red-800 dark:text-red-200 font-mono whitespace-pre-wrap break-all mt-1">
                  {error.stack}
                </pre>
              </div>
            )}
          </div>
        </details>
      )}
    </div>
  );
}

export default ErrorMessage;
