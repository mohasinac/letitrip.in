/**
 * Unified Progress & Avatar Components
 * Progress bars, circular progress, and user avatars
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";

// ============================================================================
// PROGRESS BAR
// ============================================================================

export interface UnifiedProgressProps {
  value: number;
  max?: number;
  variant?: "default" | "success" | "warning" | "error" | "info";
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  label?: string;
  striped?: boolean;
  animated?: boolean;
  className?: string;
}

const progressSizeClasses = {
  sm: "h-2",
  md: "h-3",
  lg: "h-4",
};

const progressVariantClasses = {
  default: "bg-primary",
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error",
  info: "bg-info",
};

export const UnifiedProgress: React.FC<UnifiedProgressProps> = ({
  value,
  max = 100,
  variant = "default",
  size = "md",
  showLabel = false,
  label,
  striped = false,
  animated = false,
  className,
}) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={cn("w-full", className)}>
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-text">
            {label || "Progress"}
          </span>
          <span className="text-sm font-medium text-textSecondary">
            {Math.round(percentage)}%
          </span>
        </div>
      )}

      <div
        className={cn(
          "w-full bg-surfaceVariant rounded-full overflow-hidden",
          progressSizeClasses[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        <div
          className={cn(
            "h-full transition-all duration-300 ease-in-out",
            progressVariantClasses[variant],
            striped &&
              "bg-gradient-to-r from-current via-transparent to-current bg-[length:30px_100%]",
            animated && striped && "animate-progress-stripes"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

// ============================================================================
// CIRCULAR PROGRESS
// ============================================================================

export interface CircularProgressProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  variant?: "default" | "success" | "warning" | "error" | "info";
  showLabel?: boolean;
  className?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  value,
  max = 100,
  size = 120,
  strokeWidth = 8,
  variant = "default",
  showLabel = true,
  className,
}) => {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    default: "text-primary",
    success: "text-success",
    warning: "text-warning",
    error: "text-error",
    info: "text-info",
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className
      )}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-surfaceVariant"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={cn("transition-all duration-300", variantColors[variant])}
        />
      </svg>

      {showLabel && (
        <span className="absolute text-2xl font-bold text-text">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
};

// ============================================================================
// UNIFIED AVATAR
// ============================================================================

export interface UnifiedAvatarProps {
  // Image
  src?: string;
  alt?: string;

  // Fallback
  name?: string;
  initials?: string;

  // Size
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

  // Style
  variant?: "circular" | "rounded" | "square";

  // Status
  status?: "online" | "offline" | "away" | "busy";

  // HTML
  className?: string;
}

const avatarSizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
  xl: "w-16 h-16 text-xl",
  "2xl": "w-24 h-24 text-3xl",
};

const avatarVariantClasses = {
  circular: "rounded-full",
  rounded: "rounded-lg",
  square: "rounded-none",
};

const statusColors = {
  online: "bg-success",
  offline: "bg-textTertiary",
  away: "bg-warning",
  busy: "bg-error",
};

export const UnifiedAvatar: React.FC<UnifiedAvatarProps> = ({
  src,
  alt,
  name,
  initials,
  size = "md",
  variant = "circular",
  status,
  className,
}) => {
  const [imageError, setImageError] = React.useState(false);

  const getInitials = () => {
    if (initials) return initials;
    if (name) {
      const names = name.split(" ");
      if (names.length >= 2) {
        return `${names[0][0]}${names[1][0]}`.toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    return "??";
  };

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "flex items-center justify-center font-semibold",
          "bg-primary text-white overflow-hidden",
          avatarSizeClasses[size],
          avatarVariantClasses[variant]
        )}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={alt || name || "Avatar"}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <span>{getInitials()}</span>
        )}
      </div>

      {/* Status Indicator */}
      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-surface",
            statusColors[status]
          )}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
};

// ============================================================================
// AVATAR GROUP
// ============================================================================

export interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    name?: string;
    alt?: string;
  }>;
  max?: number;
  size?: UnifiedAvatarProps["size"];
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 5,
  size = "md",
  className,
}) => {
  const displayedAvatars = avatars.slice(0, max);
  const remainingCount = Math.max(avatars.length - max, 0);

  return (
    <div className={cn("flex -space-x-2", className)}>
      {displayedAvatars.map((avatar, index) => (
        <div key={index} className="ring-2 ring-surface rounded-full">
          <UnifiedAvatar {...avatar} size={size} />
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={cn(
            "flex items-center justify-center font-semibold",
            "bg-surfaceVariant text-text ring-2 ring-surface",
            avatarSizeClasses[size],
            "rounded-full"
          )}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
};

export default {
  Progress: UnifiedProgress,
  CircularProgress,
  Avatar: UnifiedAvatar,
  AvatarGroup,
};
