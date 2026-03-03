"use client";

import React from "react";
import { THEME_CONSTANTS } from "@/constants";
import { Span } from "../typography/Typography";

/**
 * Progress Bar Component
 *
 * Visual indicator of task completion or loading progress.
 * Supports multiple variants and optional label.
 *
 * @component
 * @example
 * ```tsx
 * <Progress value={60} />
 * <Progress value={80} variant="success" label="80% Complete" />
 * <Progress value={100} size="lg" showValue />
 * ```
 */

interface ProgressProps {
  value: number;
  max?: number;
  variant?: "primary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  label?: string;
  showValue?: boolean;
  className?: string;
}

export default function Progress({
  value,
  max = 100,
  variant = "primary",
  size = "md",
  label,
  showValue = false,
  className = "",
}: ProgressProps) {
  const { themed, flex, position } = THEME_CONSTANTS;

  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variantClasses = {
    primary: "bg-blue-600 dark:bg-blue-500",
    success: "bg-green-600 dark:bg-green-500",
    warning: "bg-yellow-600 dark:bg-yellow-500",
    error: "bg-red-600 dark:bg-red-500",
  };

  return (
    <div className={className}>
      {(label || showValue) && (
        <div className={`${flex.between} mb-2`}>
          {label && (
            <Span className={`text-sm font-medium ${themed.textPrimary}`}>
              {label}
            </Span>
          )}
          {showValue && (
            <Span className={`text-sm font-medium ${themed.textSecondary}`}>
              {Math.round(percentage)}%
            </Span>
          )}
        </div>
      )}

      <div
        className={`
          w-full ${sizeClasses[size]} rounded-full overflow-hidden
          ${themed.bgSecondary}
        `}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || `Progress: ${Math.round(percentage)}%`}
      >
        <div
          className={`
            h-full ${variantClasses[variant]}
            transition-all duration-300 ease-in-out
            rounded-full
          `}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

// IndeterminateProgress - for unknown duration tasks
interface IndeterminateProgressProps {
  variant?: "primary" | "success" | "warning" | "error";
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
}

export function IndeterminateProgress({
  variant = "primary",
  size = "md",
  label,
  className = "",
}: IndeterminateProgressProps) {
  const { themed, position } = THEME_CONSTANTS;

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3",
  };

  const variantClasses = {
    primary: "bg-blue-600 dark:bg-blue-500",
    success: "bg-green-600 dark:bg-green-500",
    warning: "bg-yellow-600 dark:bg-yellow-500",
    error: "bg-red-600 dark:bg-red-500",
  };

  return (
    <div className={className}>
      {label && (
        <Span
          className={`block text-sm font-medium mb-2 ${themed.textPrimary}`}
        >
          {label}
        </Span>
      )}

      <div
        className={`
          w-full ${sizeClasses[size]} rounded-full overflow-hidden
          ${themed.bgSecondary}
          relative
        `}
        role="progressbar"
        aria-label={label || "Loading..."}
      >
        <div
          className={`
            ${position.fill} ${variantClasses[variant]}
            animate-[progress_1.5s_ease-in-out_infinite]
            rounded-full
          `}
          style={{
            width: "40%",
            animation: "progress-indeterminate 1.5s ease-in-out infinite",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes progress-indeterminate {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(350%);
          }
        }
      `}</style>
    </div>
  );
}
