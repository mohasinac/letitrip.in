/**
 * @fileoverview React Component
 * @module src/app/admin/demo/components/DemoProgressBar
 * @description This file contains the DemoProgressBar component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

/**
 * DemoProgressBarProps interface
 * 
 * @interface
 * @description Defines the structure and contract for DemoProgressBarProps
 */
interface DemoProgressBarProps {
  /** Completed Steps */
  completedSteps: number;
  /** Total Steps */
  totalSteps: number;
  /** Label */
  label: string;
  /** Color */
  color?: "blue" | "red";
}

/**
 * Function: Demo Progress Bar
 */
/**
 * Performs demo progress bar operation
 *
 * @returns {any} The demoprogressbar result
 *
 * @example
 * DemoProgressBar();
 */

/**
 * Performs demo progress bar operation
 *
 * @returns {any} The demoprogressbar result
 *
 * @example
 * DemoProgressBar();
 */

export function DemoProgressBar({
  completedSteps,
  totalSteps,
  label,
  color = "blue",
}: DemoProgressBarProps) {
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);
  const barColor = color === "red" ? "bg-red-600" : "bg-blue-600";

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {label}
        </span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {completedSteps} / {totalSteps} steps ({progressPercent}%)
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div
          className={`${barColor} h-3 rounded-full transition-all duration-500`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
