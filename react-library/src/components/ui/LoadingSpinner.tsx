/**
 * LoadingSpinner Component
 *
 * Pure React component for displaying loading spinners with various sizes and colors.
 * Framework-independent implementation with customizable appearance.
 *
 * Features:
 * - Multiple sizes (sm, md, lg, xl)
 * - Color variants (primary, white, gray, custom)
 * - Full screen overlay option
 * - Optional loading message
 * - Customizable CSS classes
 *
 * @example
 * ```tsx
 * <LoadingSpinner size="lg" message="Loading data..." />
 * <LoadingSpinner fullScreen color="white" />
 * ```
 */

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  color?: "primary" | "white" | "gray";
  fullScreen?: boolean;
  message?: string;
  className?: string;
  spinnerClassName?: string;
  messageClassName?: string;
}

export function LoadingSpinner({
  size = "md",
  color = "primary",
  fullScreen = false,
  message,
  className = "",
  spinnerClassName = "",
  messageClassName = "",
}: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
    xl: "h-16 w-16",
  };

  const colors = {
    primary: "border-blue-600",
    white: "border-white",
    gray: "border-gray-900",
  };

  const spinner = (
    <div
      className={`animate-spin rounded-full border-2 border-t-transparent ${sizes[size]} ${colors[color]} ${spinnerClassName}`}
      role="status"
      aria-label={message || "Loading"}
    />
  );

  const content = (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
    >
      {spinner}
      {message && (
        <p
          className={`text-sm text-gray-600 dark:text-gray-400 ${messageClassName}`}
        >
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="rounded-lg bg-white dark:bg-gray-800 p-6 shadow-xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

export default LoadingSpinner;
