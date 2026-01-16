/**
 * FavoriteButton Component
 *
 * Framework-agnostic favorite toggle button with loading state.
 * Requires injectable favorite service and auth check.
 *
 * @example
 * ```tsx
 * <FavoriteButton
 *   isFavorited={isFavorited}
 *   onToggle={handleToggle}
 *   size="md"
 * />
 * ```
 */

import React, { useState } from "react";

export interface FavoriteButtonProps {
  /** Current favorited state */
  isFavorited: boolean;
  /** Toggle callback - receives new state */
  onToggle: (isFavorited: boolean) => void | Promise<void>;
  /** Button size */
  size?: "sm" | "md" | "lg";
  /** Loading state (controlled) */
  isLoading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom Heart icon (filled) */
  HeartFilledIcon?: React.ComponentType<{ className?: string }>;
  /** Custom Heart icon (outline) */
  HeartOutlineIcon?: React.ComponentType<{ className?: string }>;
  /** Custom Loader icon */
  LoaderIcon?: React.ComponentType<{ className?: string }>;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default inline SVG icons
function DefaultHeartFilledIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function DefaultHeartOutlineIcon({ className }: { className?: string }) {
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
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function DefaultLoaderIcon({ className }: { className?: string }) {
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
      <line x1="12" y1="2" x2="12" y2="6" />
      <line x1="12" y1="18" x2="12" y2="22" />
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76" />
      <line x1="16.24" y1="16.24" x2="19.07" y2="19.07" />
      <line x1="2" y1="12" x2="6" y2="12" />
      <line x1="18" y1="12" x2="22" y2="12" />
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24" />
      <line x1="16.24" y1="7.76" x2="19.07" y2="4.93" />
    </svg>
  );
}

export function FavoriteButton({
  isFavorited,
  onToggle,
  size = "md",
  isLoading: controlledLoading,
  disabled = false,
  className = "",
  HeartFilledIcon = DefaultHeartFilledIcon,
  HeartOutlineIcon = DefaultHeartOutlineIcon,
  LoaderIcon = DefaultLoaderIcon,
}: FavoriteButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = controlledLoading ?? internalLoading;

  const handleClick = async () => {
    if (isLoading || disabled) return;

    setInternalLoading(true);
    try {
      await onToggle(!isFavorited);
    } catch (error) {
      console.error("Failed to toggle favorite:", error);
    } finally {
      setInternalLoading(false);
    }
  };

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center rounded-full",
        "transition-all duration-200",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        isFavorited
          ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 focus:ring-red-500"
          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:ring-gray-500",
        (disabled || isLoading) && "opacity-50 cursor-not-allowed",
        sizeClasses[size],
        className
      )}
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      {isLoading ? (
        <LoaderIcon className={cn(iconSizes[size], "animate-spin")} />
      ) : isFavorited ? (
        <HeartFilledIcon className={iconSizes[size]} />
      ) : (
        <HeartOutlineIcon className={iconSizes[size]} />
      )}
    </button>
  );
}

export default FavoriteButton;
