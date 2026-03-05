"use client";

import { useCountdown } from "@/hooks";
import type { CountdownRemaining } from "@/hooks";
import { classNames } from "@/helpers";

export interface CountdownDisplayProps {
  targetDate: Date;
  /**
   * 'dhms' — always show days/hours/mins/secs.
   * 'hms'  — always show hours/mins/secs (no days segment).
   * 'auto' — adaptive: shows d/h/m while days remain, then h/m/s, then m/s (default).
   */
  format?: "dhms" | "hms" | "auto";
  /** Text shown when the target date has passed. Default: "Ended" */
  expiredLabel?: string;
  className?: string;
}

function formatLabel(
  r: CountdownRemaining,
  format: "dhms" | "hms" | "auto",
): string {
  const { days, hours, minutes, seconds } = r;

  if (format === "hms") {
    const totalHours = days * 24 + hours;
    return `${totalHours}h ${minutes}m ${seconds}s`;
  }

  if (format === "dhms") {
    return `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  // auto
  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  return `${minutes}m ${seconds}s`;
}

export function CountdownDisplay({
  targetDate,
  format = "auto",
  expiredLabel = "Ended",
  className,
}: CountdownDisplayProps) {
  const remaining = useCountdown(targetDate);

  const label = remaining ? formatLabel(remaining, format) : expiredLabel;

  return (
    <span className={classNames("tabular-nums", className)}>{label}</span>
  );
}
