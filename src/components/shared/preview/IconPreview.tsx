"use client";

import React from "react";
import * as MuiIcons from "@mui/icons-material";

interface IconPreviewProps {
  iconName: string | null | undefined;
  size?: number;
  className?: string;
}

/**
 * Get Material UI icon component by name
 * @param iconName - Icon name from MuiIcons
 * @returns IconComponent or null
 */
export function getMuiIcon(iconName: string | null | undefined) {
  if (!iconName) return null;

  try {
    const IconComponent = (MuiIcons as any)[iconName];
    return IconComponent || null;
  } catch (error) {
    console.debug(`Icon not found: ${iconName}`);
    return null;
  }
}

/**
 * IconPreview Component
 * Displays Material UI icon preview with fallback states
 */
export function IconPreview({
  iconName,
  size = 48,
  className = "",
}: IconPreviewProps) {
  if (!iconName) {
    return (
      <div
        className={`w-20 h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 ${className}`}
      >
        <span className="text-xs text-gray-500 dark:text-gray-400">
          No icon
        </span>
      </div>
    );
  }

  const IconComponent = getMuiIcon(iconName);

  if (!IconComponent) {
    return (
      <div
        className={`w-20 h-20 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded border border-red-500 dark:border-red-600 ${className}`}
      >
        <span className="text-xs text-red-600 dark:text-red-400">
          Invalid icon
        </span>
      </div>
    );
  }

  return (
    <div
      className={`w-20 h-20 flex items-center justify-center bg-blue-600 dark:bg-blue-700 rounded text-white ${className}`}
    >
      <IconComponent style={{ fontSize: size }} />
    </div>
  );
}

export default IconPreview;
