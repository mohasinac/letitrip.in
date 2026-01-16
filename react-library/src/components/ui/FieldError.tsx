/**
 * FieldError Component
 *
 * Simple inline error message for form fields.
 *
 * @example
 * ```tsx
 * <FieldError error="Email is required" />
 * ```
 */

import React from "react";

export interface FieldErrorProps {
  /** Error message */
  error?: string;
  /** Additional CSS classes */
  className?: string;
  /** Custom AlertCircle icon */
  AlertCircleIcon?: React.ComponentType<{ className?: string }>;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default inline SVG icon
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

export function FieldError({
  error,
  className = "",
  AlertCircleIcon = DefaultAlertCircleIcon,
}: FieldErrorProps) {
  if (!error) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-sm text-red-600 dark:text-red-400 mt-1",
        className
      )}
    >
      <AlertCircleIcon className="w-4 h-4 flex-shrink-0" />
      <span>{error}</span>
    </div>
  );
}

export default FieldError;
