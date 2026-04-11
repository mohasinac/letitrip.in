"use client";

import { Span } from "@/components";

export interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export interface AvatarGroupProps {
  avatars: AvatarProps[];
  max?: number;
  size?: AvatarProps["size"];
  className?: string;
}

const SIZE_MAP: Record<NonNullable<AvatarProps["size"]>, string> = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
  xl: "w-16 h-16 text-lg",
};

function initials(name?: string) {
  if (!name) return "?";
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  className = "",
}: AvatarProps) {
  const sz = SIZE_MAP[size];
  if (src) {
    return (
      // eslint-disable-next-line lir/no-raw-media-elements, @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? name ?? ""}
        className={`${sz} rounded-full object-cover ${className}`}
      />
    );
  }
  return (
    <Span
      aria-label={name}
      className={`${sz} rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 flex items-center justify-center font-medium select-none ${className}`}
    >
      {initials(name)}
    </Span>
  );
}

export function AvatarGroup({
  avatars,
  max = 4,
  size = "sm",
  className = "",
}: AvatarGroupProps) {
  const shown = avatars.slice(0, max);
  const extra = avatars.length - max;
  return (
    <div className={`flex -space-x-2 ${className}`}>
      {shown.map((a, i) => (
        <Avatar
          key={i}
          {...a}
          size={size}
          className="ring-2 ring-white dark:ring-gray-900"
        />
      ))}
      {extra > 0 && (
        <Span
          className={`${SIZE_MAP[size]} rounded-full ring-2 ring-white dark:ring-gray-900 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 flex items-center justify-center text-xs font-medium`}
        >
          +{extra}
        </Span>
      )}
    </div>
  );
}

export default Avatar;
