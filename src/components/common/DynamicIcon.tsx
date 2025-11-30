"use client";

import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";

// Export all lucide icon names as a type
export type IconName = keyof typeof LucideIcons;

interface DynamicIconProps extends LucideProps {
  name: string;
  fallback?: string;
}

/**
 * DynamicIcon component for rendering Lucide icons by name
 *
 * @example
 * <DynamicIcon name="home" className="w-4 h-4" />
 * <DynamicIcon name="user" size={16} />
 */
export function DynamicIcon({
  name,
  fallback = "Circle",
  className,
  ...props
}: DynamicIconProps) {
  // Convert kebab-case or snake_case to PascalCase
  const formatIconName = (iconName: string): string => {
    return iconName
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  };

  const formattedName = formatIconName(name);

  // Try to get the icon from lucide-react
  const Icon = LucideIcons[formattedName as keyof typeof LucideIcons] as
    | React.ComponentType<LucideProps>
    | undefined;

  if (!Icon) {
    // Try fallback
    const FallbackIcon = LucideIcons[fallback as keyof typeof LucideIcons] as
      | React.ComponentType<LucideProps>
      | undefined;
    if (FallbackIcon) {
      return <FallbackIcon className={className} {...props} />;
    }
    // Ultimate fallback to Circle
    return <LucideIcons.Circle className={className} {...props} />;
  }

  return <Icon className={className} {...props} />;
}

/**
 * Get a Lucide icon component by name
 * Returns the icon component or a fallback
 */
export function getIconComponent(
  name: string,
  fallback: string = "Circle"
): React.ComponentType<LucideProps> {
  const formatIconName = (iconName: string): string => {
    return iconName
      .split(/[-_]/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");
  };

  const formattedName = formatIconName(name);
  const Icon = LucideIcons[formattedName as keyof typeof LucideIcons] as
    | React.ComponentType<LucideProps>
    | undefined;

  if (Icon) return Icon;

  const FallbackIcon = LucideIcons[fallback as keyof typeof LucideIcons] as
    | React.ComponentType<LucideProps>
    | undefined;
  if (FallbackIcon) return FallbackIcon;

  return LucideIcons.Circle;
}

export default DynamicIcon;
