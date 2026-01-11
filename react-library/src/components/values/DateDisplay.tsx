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
} from "../../utils/formatters";
import { cn } from "../../utils/cn";

interface DateDisplayProps {
  date: Date | string | number | null | undefined;
  format?: "short" | "medium" | "long" | "full";
  includeTime?: boolean;
  fallback?: string;
  className?: string;
}

export function DateDisplay({
  date,
  format = "medium",
  includeTime = false,
  fallback = "N/A",
  className,
}: DateDisplayProps) {
  const formatted = formatDate(date, { format, includeTime, fallback });

  // Safely get ISO string, handling invalid dates
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

interface RelativeDateProps {
  date: Date | string | number;
  style?: "long" | "short" | "narrow";
  className?: string;
  /** Show full date on hover */
  showFullOnHover?: boolean;
}

export function RelativeDate({
  date,
  style = "long",
  className,
  showFullOnHover = true,
}: RelativeDateProps) {
  const relative = formatRelativeTime(date, { style });
  const full = formatDate(date, { format: "long", includeTime: true });

  // Safely get ISO string, handling invalid dates
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

interface DateRangeProps {
  start: Date | string;
  end: Date | string;
  className?: string;
}

export function DateRange({ start, end, className }: DateRangeProps) {
  const formatted = formatDateRange(start, end);

  return (
    <span className={cn("text-gray-600 dark:text-gray-400", className)}>
      {formatted}
    </span>
  );
}
