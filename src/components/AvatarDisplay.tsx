"use client";

import { ImageCropData } from "./modals/ImageCropModal";
import { UI_LABELS } from "@/constants";

interface AvatarDisplayProps {
  cropData: ImageCropData | null;
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  alt?: string;
  displayName?: string | null;
  email?: string | null;
}

const sizeClasses = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
  "2xl": "w-32 h-32",
};

/**
 * AvatarDisplay component that applies crop metadata to display avatar correctly
 *
 * @example
 * ```tsx
 * <AvatarDisplay
 *   cropData={{
 *     url: 'https://...',
 *     position: { x: 50, y: 50 },
 *     zoom: 1.2
 *   }}
 *   size="lg"
 * />
 * ```
 */
export function AvatarDisplay({
  cropData,
  size = "md",
  className = "",
  alt = UI_LABELS.AVATAR.ALT_TEXT,
  displayName,
  email,
}: AvatarDisplayProps) {
  // Generate initials from displayName or email
  const getInitials = () => {
    if (displayName) {
      const names = displayName.trim().split(" ");
      if (names.length >= 2) {
        return (names[0][0] + names[names.length - 1][0]).toUpperCase();
      }
      return names[0].substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return UI_LABELS.AVATAR.DEFAULT_INITIAL;
  };

  // Generate consistent color based on name/email
  const getGradient = () => {
    const text = displayName || email || UI_LABELS.AVATAR.FALLBACK_USER;
    const colors = [
      "from-blue-500 to-blue-600",
      "from-purple-500 to-purple-600",
      "from-pink-500 to-pink-600",
      "from-green-500 to-green-600",
      "from-yellow-500 to-yellow-600",
      "from-red-500 to-red-600",
      "from-indigo-500 to-indigo-600",
      "from-teal-500 to-teal-600",
    ];
    const index = text.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
    xl: "text-2xl",
    "2xl": "text-3xl",
  };

  if (!cropData || !cropData.url) {
    // Show initials with gradient background
    return (
      <div
        className={`${sizeClasses[size]} ${className} rounded-full bg-gradient-to-br ${getGradient()} flex items-center justify-center overflow-hidden`}
        role="img"
        aria-label={alt}
      >
        <span
          className={`${textSizes[size]} font-semibold text-white select-none`}
        >
          {getInitials()}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${className} rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 relative`}
    >
      <img
        src={cropData.url}
        alt={alt}
        className="absolute w-full h-full object-cover select-none"
        style={{
          width: `${(cropData.zoom || 1) * 100}%`,
          height: `${(cropData.zoom || 1) * 100}%`,
          left: `${cropData.position?.x || 50}%`,
          top: `${cropData.position?.y || 50}%`,
          transform: "translate(-50%, -50%)",
        }}
      />
    </div>
  );
}
