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

import { useState } from "react";
import { cn } from "../../utils/cn";

interface TruncatedTextProps {
  text: string;
  maxLength?: number;
  lines?: number;
  showMoreLabel?: string;
  showLessLabel?: string;
  className?: string;
  expandable?: boolean;
}

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
        className
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
