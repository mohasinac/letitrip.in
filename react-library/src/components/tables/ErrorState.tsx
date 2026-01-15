import { ReactNode } from "react";

export interface ErrorStateProps {
  /**
   * Error message to display
   * @default "Something went wrong"
   */
  message?: string;

  /**
   * Callback function when retry button is clicked
   */
  onRetry?: () => void;

  /**
   * Type of error for default messages and styling
   * @default "error"
   */
  type?: "error" | "not-found" | "network" | "unauthorized" | "server";

  /**
   * Additional CSS classes for root element
   */
  className?: string;

  /**
   * Custom icon to display (overrides default icon)
   */
  icon?: ReactNode;

  /**
   * Custom title (overrides type-based title)
   */
  title?: string;

  /**
   * Custom retry button label
   * @default "Try Again"
   */
  retryLabel?: string;

  /**
   * Custom icon container className
   */
  iconClassName?: string;

  /**
   * Custom title className
   */
  titleClassName?: string;

  /**
   * Custom message className
   */
  messageClassName?: string;

  /**
   * Custom retry button className
   */
  retryButtonClassName?: string;

  /**
   * Optional retry icon (displayed before retry button text)
   */
  retryIcon?: ReactNode;
}

// Default icon SVGs
const AlertTriangleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="32"
    height="32"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const RefreshIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 2v6h-6" />
    <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
    <path d="M3 22v-6h6" />
    <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
  </svg>
);

/**
 * ErrorState - Display error states with optional retry functionality
 *
 * A comprehensive error state component for handling various error scenarios.
 * Provides default messages and icons for common error types, with full customization support.
 *
 * Features:
 * - Multiple error types with default messages (error, not-found, network, unauthorized, server)
 * - Optional retry button with callback
 * - Custom icons and messages
 * - Fully customizable styling for all sub-elements
 * - Dark mode support
 * - Framework-agnostic (injectable icons with sensible defaults)
 *
 * @example
 * ```tsx
 * // Basic error
 * <ErrorState />
 *
 * // With retry
 * <ErrorState onRetry={() => refetch()} />
 *
 * // Custom type
 * <ErrorState type="not-found" />
 *
 * // Fully custom
 * <ErrorState
 *   icon={<CustomIcon />}
 *   title="Custom Error"
 *   message="Something specific went wrong"
 *   onRetry={handleRetry}
 * />
 * ```
 */
export function ErrorState({
  message,
  onRetry,
  type = "error",
  className = "",
  icon,
  title,
  retryLabel = "Try Again",
  iconClassName,
  titleClassName,
  messageClassName,
  retryButtonClassName,
  retryIcon,
}: ErrorStateProps) {
  // Determine message based on type if no custom message provided
  const getMessage = (): string => {
    if (message) return message;

    switch (type) {
      case "not-found":
        return "The item you're looking for doesn't exist";
      case "network":
        return "Network error. Please check your connection";
      case "unauthorized":
        return "You don't have permission to access this resource";
      case "server":
        return "Server error. Our team has been notified";
      default:
        return "Something went wrong. Please try again";
    }
  };

  // Determine title based on type if no custom title provided
  const getTitle = (): string => {
    if (title) return title;

    switch (type) {
      case "not-found":
        return "Not Found";
      case "network":
        return "Connection Error";
      case "unauthorized":
        return "Access Denied";
      case "server":
        return "Server Error";
      default:
        return "Error";
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 px-4 ${className}`}
    >
      <div className="text-center max-w-md">
        <div
          className={
            iconClassName ||
            "inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 mb-4"
          }
        >
          {icon || <AlertTriangleIcon />}
        </div>

        <h3
          className={
            titleClassName ||
            "text-xl font-semibold text-gray-900 dark:text-white mb-2"
          }
        >
          {getTitle()}
        </h3>

        <p
          className={
            messageClassName || "text-gray-600 dark:text-gray-400 mb-6"
          }
        >
          {getMessage()}
        </p>

        {onRetry && (
          <button
            onClick={onRetry}
            className={
              retryButtonClassName ||
              "inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors"
            }
          >
            {retryIcon || <RefreshIcon />}
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}

// Default export for backward compatibility
export default ErrorState;
