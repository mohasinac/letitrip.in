/**
 * PageState Component
 *
 * A unified component for handling page loading, error, and empty states.
 * Reduces code duplication across pages by providing consistent UI patterns.
 *
 * Usage:
 * ```tsx
 * // Full page loading
 * <PageState.Loading />
 *
 * // Full page error with retry
 * <PageState.Error message={error.message} onRetry={loadData} />
 *
 * // Inline loading (for sections)
 * <PageState.Loading fullPage={false} />
 *
 * // Custom loading message
 * <PageState.Loading message="Loading products..." />
 * ```
 */

import { AlertCircle, Loader2, RefreshCw } from "lucide-react";

interface LoadingProps {
  /** Show as full page centered state */
  fullPage?: boolean;
  /** Loading message */
  message?: string;
  /** Custom className */
  className?: string;
}

interface ErrorProps {
  /** Error message to display */
  message?: string;
  /** Retry callback */
  onRetry?: () => void;
  /** Show as full page centered state */
  fullPage?: boolean;
  /** Custom className */
  className?: string;
}

interface EmptyProps {
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
  /** Custom className */
  className?: string;
}

// Full page container wrapper
function FullPageWrapper({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center ${className}`}
    >
      {children}
    </div>
  );
}

// Loading state component
function Loading({
  fullPage = true,
  message = "Loading...",
  className = "",
}: LoadingProps) {
  const content = (
    <div className={`text-center ${className}`}>
      <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400 mx-auto" />
      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{message}</p>
    </div>
  );

  if (fullPage) {
    return <FullPageWrapper>{content}</FullPageWrapper>;
  }

  return (
    <div className="flex items-center justify-center py-12">{content}</div>
  );
}

// Error state component
function Error({
  message = "Something went wrong",
  onRetry,
  fullPage = true,
  className = "",
}: ErrorProps) {
  const content = (
    <div className={`text-center ${className}`}>
      <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
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

// Empty state component (basic, use EmptyState component for more features)
function Empty({
  title = "No data found",
  description,
  action,
  icon,
  className = "",
}: EmptyProps) {
  return (
    <div className={`text-center py-12 ${className}`}>
      {icon && <div className="mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 dark:text-gray-400 mb-4">{description}</p>
      )}
      {action && (
        <button
          onClick={action.onClick}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Compound component export
export const PageState = {
  Loading,
  Error,
  Empty,
  FullPageWrapper,
};

export default PageState;
