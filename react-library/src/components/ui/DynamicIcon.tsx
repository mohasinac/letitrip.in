/**
 * DynamicIcon Component
 *
 * Framework-agnostic dynamic icon renderer.
 * Accepts icon name and renders corresponding icon component.
 *
 * @example
 * ```tsx
 * <DynamicIcon name="home" size={24} />
 * <DynamicIcon name="user" className="text-blue-600" />
 * ```
 */

import React from "react";

export interface DynamicIconProps {
  /** Icon name (lowercase, kebab-case) */
  name: string;
  /** Icon size */
  size?: number;
  /** Additional CSS classes */
  className?: string;
  /** Fallback icon name */
  fallback?: string;
  /** Icon registry (name -> component mapping) */
  iconRegistry?: Record<
    string,
    React.ComponentType<{ className?: string; size?: number }>
  >;
}

// Default icon registry with common icons
const DEFAULT_ICON_REGISTRY: Record<
  string,
  React.ComponentType<{ className?: string; size?: number }>
> = {
  home: ({ className, size = 24 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  user: ({ className, size = 24 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  settings: ({ className, size = 24 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m-9-9h6m6 0h6" />
    </svg>
  ),
  search: ({ className, size = 24 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.35-4.35" />
    </svg>
  ),
  circle: ({ className, size = 24 }) => (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
};

/**
 * Format icon name to match registry keys
 * Converts kebab-case, snake_case, PascalCase to lowercase
 */
function formatIconName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[-_]/g, "")
    .replace(/([a-z])([A-Z])/g, "$1$2")
    .toLowerCase();
}

export function DynamicIcon({
  name,
  size = 24,
  className = "",
  fallback = "circle",
  iconRegistry = DEFAULT_ICON_REGISTRY,
}: DynamicIconProps) {
  const formattedName = formatIconName(name);

  // Try to get the icon from registry
  const Icon = iconRegistry[formattedName];

  if (Icon) {
    return <Icon className={className} size={size} />;
  }

  // Try fallback
  const FallbackIcon = iconRegistry[formatIconName(fallback)];
  if (FallbackIcon) {
    return <FallbackIcon className={className} size={size} />;
  }

  // Ultimate fallback - circle
  const CircleIcon = iconRegistry["circle"] || DEFAULT_ICON_REGISTRY.circle;
  return <CircleIcon className={className} size={size} />;
}

export default DynamicIcon;
