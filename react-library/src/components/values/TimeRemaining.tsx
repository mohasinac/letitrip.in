/**
 * Time Remaining Display Component
 *
 * Displays countdown time for auctions, sales, etc.
 *
 * @example
 * <TimeRemaining endTime={new Date()} />               // Ended
 * <TimeRemaining endTime={futureDate} />               // 2d 5h 30m
 * <TimeRemaining endTime={futureDate} format="full" /> // 2 days 5 hours 30 minutes
 */

"use client";

import { AlertCircle, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "../../utils/cn";

interface TimeRemainingProps {
  endTime: Date | string | number;
  format?: "compact" | "full" | "countdown";
  showIcon?: boolean;
  className?: string;
  /** Update interval in milliseconds */
  updateInterval?: number;
  /** Callback when time ends */
  onEnd?: () => void;
  /** Show urgent styling when less than this many hours remain */
  urgentThresholdHours?: number;
}

interface TimeBreakdown {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isEnded: boolean;
  totalMs: number;
}

function getTimeBreakdown(endTime: Date | string | number): TimeBreakdown {
  const end = new Date(endTime).getTime();
  const now = Date.now();
  const diff = end - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isEnded: true,
      totalMs: 0,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return {
    days,
    hours,
    minutes,
    seconds,
    isEnded: false,
    totalMs: diff,
  };
}

function formatTimeRemaining(
  breakdown: TimeBreakdown,
  format: "compact" | "full" | "countdown"
): string {
  if (breakdown.isEnded) {
    return "Ended";
  }

  const { days, hours, minutes, seconds } = breakdown;

  switch (format) {
    case "full":
      const parts: string[] = [];
      if (days > 0) parts.push(`${days} day${days !== 1 ? "s" : ""}`);
      if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? "s" : ""}`);
      if (minutes > 0)
        parts.push(`${minutes} minute${minutes !== 1 ? "s" : ""}`);
      if (parts.length === 0) parts.push("Less than a minute");
      return parts.join(" ");

    case "countdown":
      const pad = (n: number) => n.toString().padStart(2, "0");
      if (days > 0) {
        return `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
      }
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

    case "compact":
    default:
      if (days > 0) {
        return `${days}d ${hours}h`;
      }
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      }
      if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
      }
      return `${seconds}s`;
  }
}

export function TimeRemaining({
  endTime,
  format = "compact",
  showIcon = false,
  className,
  updateInterval = 1000,
  onEnd,
  urgentThresholdHours = 24,
}: TimeRemainingProps) {
  const [breakdown, setBreakdown] = useState(() => getTimeBreakdown(endTime));

  useEffect(() => {
    const interval = setInterval(() => {
      const newBreakdown = getTimeBreakdown(endTime);
      setBreakdown(newBreakdown);

      if (newBreakdown.isEnded) {
        clearInterval(interval);
        onEnd?.();
      }
    }, updateInterval);

    return () => clearInterval(interval);
  }, [endTime, updateInterval, onEnd]);

  const isUrgent =
    !breakdown.isEnded &&
    breakdown.totalMs < urgentThresholdHours * 60 * 60 * 1000;

  const displayText = formatTimeRemaining(breakdown, format);

  if (breakdown.isEnded) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-gray-500 dark:text-gray-500",
          className
        )}
      >
        {showIcon && <Clock className="w-4 h-4" />}
        {displayText}
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1",
        isUrgent
          ? "text-orange-600 dark:text-orange-400 font-medium"
          : "text-gray-700 dark:text-gray-300",
        className
      )}
    >
      {showIcon &&
        (isUrgent ? (
          <AlertCircle className="w-4 h-4 animate-pulse" />
        ) : (
          <Clock className="w-4 h-4" />
        ))}
      {displayText}
    </span>
  );
}

export default TimeRemaining;
