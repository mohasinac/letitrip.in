/**
 * Email Display Component
 *
 * Displays email addresses with optional click-to-email and masking.
 *
 * @example
 * <Email value="user@example.com" />           // user@example.com
 * <Email value="user@example.com" clickable /> // Clickable mailto: link
 * <Email value="user@example.com" masked />    // u***@example.com
 */

"use client";

import React from "react";
import { Mail } from "lucide-react";
import { cn } from "../../utils/cn";

interface EmailProps {
  value: string;
  clickable?: boolean;
  showIcon?: boolean;
  masked?: boolean;
  className?: string;
}

export function Email({
  value,
  clickable = false,
  showIcon = false,
  masked = false,
  className,
}: EmailProps) {
  // Mask email if requested (show first char, then ***, then @domain)
  const displayValue = masked
    ? value.replace(/^(.{1})(.*)(@.*)$/, "$1***$3")
    : value;

  const content = (
    <>
      {showIcon && <Mail className="w-4 h-4 mr-1.5 inline-block" />}
      {displayValue}
    </>
  );

  if (clickable && !masked) {
    return (
      <a
        href={`mailto:${value}`}
        className={cn(
          "text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center",
          className,
        )}
      >
        {content}
      </a>
    );
  }

  return (
    <span
      className={cn(
        "text-gray-900 dark:text-white inline-flex items-center",
        className,
      )}
    >
      {content}
    </span>
  );
}
