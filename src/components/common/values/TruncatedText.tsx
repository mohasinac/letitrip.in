/**
 * @fileoverview React Component
 * @module src/components/common/values/TruncatedText
 * @description This file contains the TruncatedText component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Truncated Text Component
 *
 * Displays text with truncation and optional "Show more" functionality.
 *
 * @example
 * <TruncatedText text={longText} maxLength={100} />
 * <TruncatedText text={description} lines={2} />
 */

"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";

/**
 * TruncatedTextProps interface
 * 
 * @interface
 * @description Defines the structure and contract for TruncatedTextProps
 */
interface TruncatedTextProps {
  /** Text */
  text: string;
  /** Max Length */
  maxLength?: number;
  /** Lines */
  lines?: number;
  /** Show More Label */
  showMoreLabel?: string;
  /** Show Less Label */
  showLessLabel?: string;
  /** Class Name */
  className?: string;
  /** Expandable */
  expandable?: boolean;
}

/**
 * Function: Truncated Text
 */
/**
 * Performs truncated text operation
 *
 * @returns {any} The truncatedtext result
 *
 * @example
 * TruncatedText();
 */

/**
 * Performs truncated text operation
 *
 * @returns {any} The truncatedtext result
 *
 * @example
 * TruncatedText();
 */

export function TruncatedText({
  text,
  maxLength,
  lines,
  showMoreLabel = "Show more",
  showLessLabel = "Show less",
  className,
  expandable = true,
}: TruncatedTextProps) {
  const [expanded, setExpanded] = useState(false);

  // Character-based truncation
  if (maxLength !== undefined) {
    const isTruncated = text.length > maxLength;
    const displayText =
      expanded || !isTruncated ? text : text.slice(0, maxLength) + "...";

    return (
      <span className={cn("text-gray-700 dark:text-gray-300", className)}>
        {displayText}
        {expandable && isTruncated && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
          >
            {expanded ? showLessLabel : showMoreLabel}
          </button>
        )}
      </span>
    );
  }

  // Line-based truncation using CSS
  const lineClampClass = lines ? `line-clamp-${lines}` : "";

  return (
    <span
      className={cn(
        "text-gray-700 dark:text-gray-300",
        !expanded && lineClampClass,
        className,
      )}
    >
      {text}
      {expandable && lines && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="ml-1 text-blue-600 dark:text-blue-400 hover:underline text-sm"
        >
          {expanded ? showLessLabel : showMoreLabel}
        </button>
      )}
    </span>
  );
}

export default TruncatedText;
