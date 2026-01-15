/**
 * PageState Component
 *
 * A unified component for handling page loading, error, and empty states.
 * Reduces code duplication across pages by providing consistent UI patterns.
 *
 * Features:
 * - Loading state with customizable spinner and message
 * - Error state with optional retry functionality
 * - Empty state with optional icon, title, description, and action button
 * - Full page or inline display modes
 * - Framework-agnostic with injectable icons
 * - Dark mode support
 *
 * @example
 * ```tsx
 * // Full page loading
 * <PageState.Loading />
 *
 * // Inline loading with custom message
 * <PageState.Loading fullPage={false} message="Loading products..." />
 *
 * // Error with retry
 * <PageState.Error message="Failed to load" onRetry={handleRetry} />
 *
 * // Empty state with action
 * <PageState.Empty
 *   title="No products found"
 *   description="Try adjusting your filters"
 *   action={{ label: "Clear Filters", onClick: clearFilters }}
 * />
 * ```
 */

import React from "react";

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface LoadingProps {
  /** Show as full page centered state */
  fullPage?: boolean;
  /** Loading message */
  message?: string;
  /** Custom className for container */
  className?: string;
  /** Custom className for spinner */
  spinnerClassName?: string;
  /** Custom className for message */
  messageClassName?: string;
  /** Custom spinner icon (replaces default) */
  spinnerIcon?: React.ReactNode;
}

export interface ErrorProps {
  /** Error message to display */
  message?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Show as full page centered state */
  fullPage?: boolean;
  /** Retry button label */
  retryLabel?: string;
  /** Custom className for container */
  className?: string;
  /** Custom className for icon */
  iconClassName?: string;
  /** Custom className for message */
  messageClassName?: string;
  /** Custom className for retry button */
  buttonClassName?: string;
  /** Custom error icon (replaces default) */
  errorIcon?: React.ReactNode;
  /** Custom retry icon (replaces default) */
  retryIcon?: React.ReactNode;
}

export interface EmptyProps {
  /** Title for empty state */
  title?: string;
  /** Description for empty state */
  description?: string;
  /** Action button configuration */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Icon to display */
  icon?: React.ReactNode;
  /** Custom className for container */
  className?: string;
  /** Custom className for icon wrapper */
  iconClassName?: string;
  /** Custom className for title */
  titleClassName?: string;
  /** Custom className for description */
  descriptionClassName?: string;
  /** Custom className for action button */
  buttonClassName?: string;
}

export interface FullPageWrapperProps {
  /** Content to wrap */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
}

// ============================================================================
// Default Icons (Inline SVG)
// ============================================================================

const DefaultSpinnerIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    className={`animate-spin ${className}`}
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const DefaultAlertCircleIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
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

const DefaultRefreshIcon: React.FC<{ className?: string }> = ({
  className = "",
}) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
  </svg>
);

// ============================================================================
// Full Page Container Wrapper
// ============================================================================

/**
 * Full page wrapper for centering page states
 */
function FullPageWrapper({
  children,
  className = "",
}: FullPageWrapperProps): JSX.Element {
  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center ${className}`}
    >
      {children}
    </div>
  );
}

// ============================================================================
// Loading State Component
// ============================================================================

/**
 * Loading state component with spinner and message
 */
function Loading({
  fullPage = true,
  message = "Loading...",
  className = "",
  spinnerClassName = "",
  messageClassName = "",
  spinnerIcon,
}: LoadingProps): JSX.Element {
  const content = (
    <div className={`text-center ${className}`}>
      {spinnerIcon || (
        <DefaultSpinnerIcon
          className={`h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto ${spinnerClassName}`}
        />
      )}
      <p
        className={`mt-2 text-sm text-gray-600 dark:text-gray-400 ${messageClassName}`}
      >
        {message}
      </p>
    </div>
  );

  if (fullPage) {
    return <FullPageWrapper>{content}</FullPageWrapper>;
  }

  return (
    <div className="flex items-center justify-center py-12">{content}</div>
  );
}

// ============================================================================
// Error State Component
// ============================================================================

/**
 * Error state component with optional retry functionality
 */
function Error({
  message = "Something went wrong",
  onRetry,
  fullPage = true,
  retryLabel = "Retry",
  className = "",
  iconClassName = "",
  messageClassName = "",
  buttonClassName = "",
  errorIcon,
  retryIcon,
}: ErrorProps): JSX.Element {
  const content = (
    <div className={`text-center ${className}`}>
      {errorIcon || (
        <DefaultAlertCircleIcon
          className={`h-12 w-12 text-red-500 mx-auto mb-4 ${iconClassName}`}
        />
      )}
      <p
        className={`text-lg text-gray-600 dark:text-gray-400 mb-4 ${messageClassName}`}
      >
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${buttonClassName}`}
        >
          {retryIcon || <DefaultRefreshIcon className="h-4 w-4" />}
          {retryLabel}
        </button>
      )}
    </div>
  );

  if (fullPage) {
    return <FullPageWrapper>{content}</FullPageWrapper>;
  }

  return (
    <div className="flex items-center justify-center py-12">{content}</div>
  );
}

// ============================================================================
// Empty State Component
// ============================================================================

/**
 * Empty state component with optional icon, title, description, and action
 * Note: For more advanced empty states, use the EmptyState component
 */
function Empty({
  title = "No data found",
  description,
  action,
  icon,
  className = "",
  iconClassName = "",
  titleClassName = "",
  descriptionClassName = "",
  buttonClassName = "",
}: EmptyProps): JSX.Element {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && <div className={`mb-4 ${iconClassName}`}>{icon}</div>}
      <h3
        className={`text-lg font-medium text-gray-900 dark:text-white mb-2 ${titleClassName}`}
      >
        {title}
      </h3>
      {description && (
        <p
          className={`text-gray-500 dark:text-gray-400 mb-4 ${descriptionClassName}`}
        >
          {description}
        </p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className={`inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${buttonClassName}`}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Compound Component Export
// ============================================================================

/**
 * PageState compound component for unified page state management
 */
export const PageState = {
  Loading,
  Error,
  Empty,
  FullPageWrapper,
};

/**
 * Default export for backward compatibility
 */
export default PageState;
