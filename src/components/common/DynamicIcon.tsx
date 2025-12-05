/**
 * @fileoverview React Component
 * @module src/components/common/DynamicIcon
 * @description This file contains the DynamicIcon component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import * as LucideIcons from "lucide-react";
import type { LucideProps } from "lucide-react";

// Export all lucide icon names as a type
/**
 * IconName type
 * 
 * @typedef {Object} IconName
 * @description Type definition for IconName
 */
export type IconName = keyof typeof LucideIcons;

/**
 * DynamicIconProps interface
 * 
 * @interface
 * @description Defines the structure and contract for DynamicIconProps
 */
interface DynamicIconProps extends LucideProps {
  /** Name */
  name: string;
  /** Fallback */
  fallback?: string;
}

/**
 * DynamicIcon component for rendering Lucide icons by name
 *
 * @example
 * <DynamicIcon name="home" className="w-4 h-4" />
 * <DynamicIcon name="user" size={16} />
 */
/**
 * Performs dynamic icon operation
 *
 * @returns {any} The dynamicicon result
 *
 * @example
 * DynamicIcon();
 */

/**
 * Performs dynamic icon operation
 *
 * @returns {any} The dynamicicon result
 *
 * @example
 * DynamicIcon();
 */

export function DynamicIcon({
  name,
  fallback = "Circle",
  className,
  ...props
}: DynamicIconProps) {
  // Convert kebab-case or snake_case to PascalCase
  /**
   * Formats icon name
   *
   * @param {string} iconName - Name of icon
   *
   * @returns {string} The formaticonname result
   */

  /**
   * Formats icon name
   *
   * @param {string} iconName - Name of icon
   *
   * @returns {string} The formaticonname result
   */

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
/**
 * Retrieves icon component
 *
 * @param {string} name - The name
 * @param {string} [fallback] - The fallback
 *
 * @returns {string} The iconcomponent result
 *
 * @example
 * getIconComponent("example", "example");
 */

/**
 * Retrieves icon component
 *
 * @returns {string} The iconcomponent result
 *
 * @example
 * getIconComponent();
 */

export function getIconComponent(
  /** Name */
  name: string,
  /** Fallback */
  fallback: string = "Circle",
): React.ComponentType<LucideProps> {
  /**
   * Formats icon name
   *
   * @param {string} iconName - Name of icon
   *
   * @returns {string} The formaticonname result
   */

  /**
   * Formats icon name
   *
   * @param {string} iconName - Name of icon
   *
   * @returns {string} The formaticonname result
   */

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
