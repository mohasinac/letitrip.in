/**
 * @fileoverview React Component
 * @module src/components/common/values/DateDisplay
 * @description This file contains the DateDisplay component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

/**
 * Date Display Components
 *
 * Provides consistent date formatting across the application.
 *
 * @example
 * <DateDisplay date={new Date()} />                    // Dec 2, 2025
 * <DateDisplay date="2025-12-02" includeTime />        // Dec 2, 2025, 10:30 AM
 * <RelativeDate date={new Date()} />                   // just now / 2 hours ago
 * <DateRange start={startDate} end={endDate} />        // Dec 1, 2025 - Dec 15, 2025
 */

"use client";

import React from "react";
import {
  formatDate,
  formatRelativeTime,
  formatDateRange,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";

/**
 * DateDisplayProps interface
 * 
 * @interface
 * @description Defines the structure and contract for DateDisplayProps
 */
interface DateDisplayProps {
  /** Date */
  date: Date | string | number | null | undefined;
  /** Format */
  format?: "short" | "medium" | "long" | "full";
  /** Include Time */
  includeTime?: boolean;
  /** Fallback */
  fallback?: string;
  /** Class Name */
  className?: string;
}

/**
 * Function: Date Display
 */
/**
 * Performs date display operation
 *
 * @returns {any} The datedisplay result
 *
 * @example
 * DateDisplay();
 */

/**
 * Performs date display operation
 *
 * @returns {any} The datedisplay result
 *
 * @example
 * DateDisplay();
 */

export function DateDisplay({
  date,
  format = "medium",
  includeTime = false,
  fallback = "N/A",
  className,
}: DateDisplayProps) {
  const formatted = formatDate(date, { format, includeTime, fallback });

  // Safely get ISO string, handling invalid dates
  /**
   * Retrieves date time attr
   *
   * @returns {string} The datetimeattr result
   */

  /**
   * Retrieves date time attr
   *
   * @returns {string} The datetimeattr result
   */

  const getDateTimeAttr = (): string | undefined => {
    if (!date) return undefined;
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return undefined;
      return d.toISOString();
    } catch {
      return undefined;
    }
  };

  return (
    <time
      dateTime={getDateTimeAttr()}
      className={cn("text-gray-600 dark:text-gray-400", className)}
    >
      {formatted}
    </time>
  );
}

/**
 * RelativeDateProps interface
 * 
 * @interface
 * @description Defines the structure and contract for RelativeDateProps
 */
interface RelativeDateProps {
  /** Date */
  date: Date | string | number;
  /** Style */
  style?: "long" | "short" | "narrow";
  /** Class Name */
  className?: string;
  /** Show full date on hover */
  showFullOnHover?: boolean;
}

/**
 * Function: Relative Date
 */
/**
 * Performs relative date operation
 *
 * @returns {any} The relativedate result
 *
 * @example
 * RelativeDate();
 */

/**
 * Performs relative date operation
 *
 * @returns {any} The relativedate result
 *
 * @example
 * RelativeDate();
 */

export function RelativeDate({
  date,
  style = "long",
  className,
  showFullOnHover = true,
}: RelativeDateProps) {
  const relative = formatRelativeTime(date, { style });
  const full = formatDate(date, { format: "long", includeTime: true });

  // Safely get ISO string, handling invalid dates
  /**
   * Retrieves date time attr
   *
   * @returns {string} The datetimeattr result
   */

  /**
   * Retrieves date time attr
   *
   * @returns {string} The datetimeattr result
   */

  const getDateTimeAttr = (): string | undefined => {
    if (!date) return undefined;
    try {
      const d = new Date(date);
      if (isNaN(d.getTime())) return undefined;
      return d.toISOString();
    } catch {
      return undefined;
    }
  };

  return (
    <time
      dateTime={getDateTimeAttr()}
      title={showFullOnHover ? full : undefined}
      className={cn(
        "text-gray-600 dark:text-gray-400 cursor-default",
        className,
      )}
    >
      {relative}
    </time>
  );
}

/**
 * DateRangeProps interface
 * 
 * @interface
 * @description Defines the structure and contract for DateRangeProps
 */
interface DateRangeProps {
  /** Start */
  start: Date | string;
  /** End */
  end: Date | string;
  /** Class Name */
  className?: string;
}

/**
 * Function: Date Range
 */
/**
 * Performs date range operation
 *
 * @param {DateRangeProps} { start, end, className } - The { start, end, class name }
 *
 * @returns {any} The daterange result
 *
 * @example
 * DateRange({ start, end, className });
 */

/**
 * Performs date range operation
 *
 * @param {DateRangeProps} { start, end, className } - The { start, end, class name }
 *
 * @returns {any} The daterange result
 *
 * @example
 * DateRange({ start, end, className });
 */

export function DateRange({ start, end, className }: DateRangeProps) {
  const formatted = formatDateRange(start, end);

  return (
    <span className={cn("text-gray-600 dark:text-gray-400", className)}>
      {formatted}
    </span>
  );
}
