import React from "react";
import { THEME_CONSTANTS } from "@/constants";

/**
 * Avatar Component
 *
 * Display user profile images with fallback to initials.
 * Supports multiple sizes and optional status indicator.
 *
 * @component
 * @example
 * ```tsx
 * <Avatar src="/user.jpg" alt="John Doe" />
 * <Avatar initials="JD" size="lg" />
 * <Avatar src="/user.jpg" status="online" />
 * ```
 */

interface AvatarProps {
  src?: string;
  alt?: string;
  initials?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  status?: "online" | "offline" | "busy" | "away";
  className?: string;
}

export default function Avatar({
  src,
  alt = "Avatar",
  initials,
  size = "md",
  status,
  className = "",
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);
  const { themed } = THEME_CONSTANTS;

  const sizeClasses = {
    xs: "w-6 h-6 text-xs",
    sm: "w-8 h-8 text-sm",
    md: "w-10 h-10 text-base",
    lg: "w-12 h-12 text-lg",
    xl: "w-16 h-16 text-xl",
    "2xl": "w-24 h-24 text-3xl",
  };

  const statusSizes = {
    xs: "w-1.5 h-1.5",
    sm: "w-2 h-2",
    md: "w-2.5 h-2.5",
    lg: "w-3 h-3",
    xl: "w-4 h-4",
    "2xl": "w-6 h-6",
  };

  const statusColors = {
    online: "bg-green-500",
    offline: `${themed.bgTertiary}`,
    busy: "bg-red-500",
    away: "bg-yellow-500",
  };

  const showImage = src && !imageError;
  const showInitials = !showImage && initials;

  return (
    <div className={`relative inline-flex ${className}`}>
      <div
        className={`
          ${sizeClasses[size]}
          rounded-full overflow-hidden
          flex items-center justify-center
          ${themed.bgSecondary}
          ${showInitials ? themed.textPrimary : ""}
          font-semibold
        `}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : showInitials ? (
          <span>{initials}</span>
        ) : (
          <svg
            className={`w-full h-full ${themed.textMuted}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        )}
      </div>

      {status && (
        <span
          className={`
            absolute bottom-0 right-0
            ${statusSizes[size]}
            ${statusColors[status]}
            rounded-full border-2 ${themed.bgSecondary.replace("bg-", "border-")}
          `}
          aria-label={`Status: ${status}`}
        />
      )}
    </div>
  );
}

// AvatarGroup - for displaying multiple avatars
interface AvatarGroupProps {
  children: React.ReactNode;
  max?: number;
  className?: string;
}

export function AvatarGroup({
  children,
  max = 3,
  className = "",
}: AvatarGroupProps) {
  const { themed } = THEME_CONSTANTS;
  const avatars = React.Children.toArray(children);
  const displayAvatars = max ? avatars.slice(0, max) : avatars;
  const remainingCount = max ? avatars.length - max : 0;

  return (
    <div className={`flex -space-x-2 ${className}`}>
      {displayAvatars.map((avatar, index) => (
        <div
          key={index}
          className={`ring-2 ${themed.bgSecondary.replace("bg-", "ring-")} rounded-full`}
        >
          {avatar}
        </div>
      ))}
      {remainingCount > 0 && (
        <div
          className={`
            w-10 h-10 rounded-full
            ${themed.bgTertiary}
            flex items-center justify-center
            text-sm font-medium ${themed.textSecondary}
            ring-2 ${themed.bgSecondary.replace("bg-", "ring-")}
          `}
        >
          +{remainingCount}
        </div>
      )}
    </div>
  );
}
