/**
 * Unified Timeline Component
 * Vertical timeline for tracking events, order status, shipment tracking, etc.
 */

"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Check, Clock, X, AlertTriangle, Info } from "lucide-react";

export interface TimelineEvent {
  title: string;
  description?: string;
  timestamp: string;
  icon?: React.ReactNode;
  color?: "primary" | "success" | "error" | "warning" | "info" | "grey";
  location?: string;
}

export interface TimelineProps {
  events: TimelineEvent[];
  /** Variant: default (with cards) or compact (minimal) */
  variant?: "default" | "compact";
  /** Show timestamps on opposite side (only for default variant) */
  showTimestamps?: boolean;
  /** Position of timestamps (only for default variant) */
  timestampPosition?: "left" | "right" | "alternate";
  /** Reverse chronological order (newest first) */
  reverse?: boolean;
  className?: string;
}

const colorClasses = {
  primary: {
    dot: "bg-primary border-primary",
    connector: "bg-primary/30",
  },
  success: {
    dot: "bg-success border-success",
    connector: "bg-success/30",
  },
  error: {
    dot: "bg-error border-error",
    connector: "bg-error/30",
  },
  warning: {
    dot: "bg-warning border-warning",
    connector: "bg-warning/30",
  },
  info: {
    dot: "bg-info border-info",
    connector: "bg-info/30",
  },
  grey: {
    dot: "bg-gray-400 border-gray-400",
    connector: "bg-gray-300 dark:bg-gray-600",
  },
};

const defaultIcons = {
  primary: <Clock className="w-3 h-3" />,
  success: <Check className="w-3 h-3" />,
  error: <X className="w-3 h-3" />,
  warning: <AlertTriangle className="w-3 h-3" />,
  info: <Info className="w-3 h-3" />,
  grey: <Clock className="w-3 h-3" />,
};

export function Timeline({
  events,
  variant = "default",
  showTimestamps = true,
  timestampPosition = "left",
  reverse = false,
  className,
}: TimelineProps) {
  const displayEvents = reverse ? [...events].reverse() : events;

  // Compact variant - simple, minimal design
  if (variant === "compact") {
    return (
      <div className={cn("space-y-4", className)}>
        {displayEvents.map((event, index) => {
          const color = event.color || "grey";
          const icon = event.icon || defaultIcons[color];
          const isLast = index === displayEvents.length - 1;

          return (
            <div key={index} className="relative flex gap-3">
              {/* Timeline Track */}
              <div className="flex flex-col items-center flex-shrink-0">
                {/* Dot */}
                <div
                  className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center z-10",
                    "bg-white dark:bg-gray-900",
                    index === 0 && colorClasses[color].dot,
                    index > 0 && "bg-gray-300 dark:bg-gray-600 border-gray-300"
                  )}
                >
                  {index === 0 && (
                    <span className="text-white scale-75">{icon}</span>
                  )}
                </div>

                {/* Connector Line */}
                {!isLast && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 min-h-[32px]",
                      "bg-gray-300 dark:bg-gray-600"
                    )}
                  />
                )}
              </div>

              {/* Content */}
              <div className={cn("flex-1", !isLast && "pb-2")}>
                <p
                  className={cn(
                    "text-sm mb-1",
                    index === 0
                      ? "font-bold text-text"
                      : "font-medium text-textSecondary"
                  )}
                >
                  {event.title}
                </p>
                <div className="text-xs text-textSecondary space-y-0.5">
                  <p>
                    {new Date(event.timestamp).toLocaleDateString()} •{" "}
                    {new Date(event.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                  {event.location && <p>📍 {event.location}</p>}
                  {event.description && <p>{event.description}</p>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Default variant - full-featured with cards
  return (
    <div className={cn("space-y-0", className)}>
      {displayEvents.map((event, index) => {
        const color = event.color || "grey";
        const icon = event.icon || defaultIcons[color];
        const isLast = index === displayEvents.length - 1;
        const showLeft =
          timestampPosition === "left" ||
          (timestampPosition === "alternate" && index % 2 === 0);

        return (
          <div key={index} className="relative flex gap-4">
            {/* Timestamp - Left/Alternate */}
            {showTimestamps && showLeft && (
              <div className="w-32 text-right flex-shrink-0">
                <p className="text-xs text-textSecondary">
                  {new Date(event.timestamp).toLocaleDateString()}
                </p>
                <p className="text-xs text-textSecondary">
                  {new Date(event.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            {/* Timeline Track */}
            <div className="flex flex-col items-center flex-shrink-0">
              {/* Dot */}
              <div
                className={cn(
                  "w-8 h-8 rounded-full border-4 flex items-center justify-center z-10",
                  "bg-white dark:bg-gray-900",
                  colorClasses[color].dot
                )}
              >
                <span className="text-white">{icon}</span>
              </div>

              {/* Connector Line */}
              {!isLast && (
                <div
                  className={cn(
                    "w-0.5 h-full min-h-[40px] -mt-1",
                    colorClasses[color].connector
                  )}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn("flex-1", !isLast && "pb-6")}>
              <div className="bg-surface border border-border rounded-lg p-4 shadow-sm">
                <h4 className="text-sm font-semibold text-text mb-1">
                  {event.title}
                </h4>
                {event.description && (
                  <p className="text-xs text-textSecondary mb-2">
                    {event.description}
                  </p>
                )}
                {event.location && (
                  <p className="text-xs text-textSecondary flex items-center gap-1">
                    <span>📍</span>
                    {event.location}
                  </p>
                )}
              </div>
            </div>

            {/* Timestamp - Right/Alternate */}
            {showTimestamps && !showLeft && (
              <div className="w-32 text-left flex-shrink-0">
                <p className="text-xs text-textSecondary">
                  {new Date(event.timestamp).toLocaleDateString()}
                </p>
                <p className="text-xs text-textSecondary">
                  {new Date(event.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
