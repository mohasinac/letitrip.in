/**
 * MediaAvatar
 *
 * Tier 1 primitive for displaying user / seller / brand profile pictures.
 * Manages its own circular sizing — no wrapper div needed in the caller.
 *
 * Usage:
 *   <MediaAvatar src={user.photoURL} alt={user.displayName} size="sm" />
 */

import { MediaImage } from "./MediaImage";

export interface MediaAvatarProps {
  /** Avatar image URL. Shows a 👤 fallback when undefined. */
  src: string | undefined;
  /** Descriptive alt text — required for accessibility. */
  alt: string;
  /** Circular size preset. Defaults to `'md'`. */
  size?: "sm" | "md" | "lg" | "xl";
  /** Additional classes applied to the outer circle wrapper. */
  className?: string;
}

const sizeClasses: Record<NonNullable<MediaAvatarProps["size"]>, string> = {
  sm: "w-8 h-8",
  md: "w-10 h-10",
  lg: "w-14 h-14",
  xl: "w-20 h-20",
};

export function MediaAvatar({
  src,
  alt,
  size = "md",
  className = "",
}: MediaAvatarProps) {
  return (
    <div
      className={`relative ${sizeClasses[size]} rounded-full overflow-hidden flex-shrink-0 ${className}`}
    >
      <MediaImage src={src} alt={alt} size="avatar" />
    </div>
  );
}
