/**
 * Percentage Display Component
 *
 * Displays percentages with proper formatting and optional color coding.
 *
 * @example
 * <Percentage value={25} />                    // 25%
 * <Percentage value={-10} showSign />          // -10%
 * <Percentage value={25} type="discount" />    // 25% off (green)
 * <Percentage value={15} type="increase" />    // +15% (red for price increase)
 */

"use client";

// React import not needed in React 17+ JSX transform
import { TrendingDown, TrendingUp } from "lucide-react";
import { cn } from "../../utils/cn";

interface PercentageProps {
  value: number;
  showSign?: boolean;
  showIcon?: boolean;
  type?: "neutral" | "discount" | "increase" | "decrease";
  suffix?: string;
  precision?: number;
  className?: string;
}

export function Percentage({
  value,
  showSign = false,
  showIcon = false,
  type = "neutral",
  suffix = "%",
  precision = 0,
  className,
}: PercentageProps) {
  const isPositive = value > 0;
  const isNegative = value < 0;
  const sign = showSign && isPositive ? "+" : "";

  const formattedValue =
    precision > 0
      ? Math.abs(value).toFixed(precision)
      : Math.abs(value).toString();

  const colorClasses = {
    neutral: "text-gray-700 dark:text-gray-300",
    discount: "text-green-600 dark:text-green-400",
    increase: "text-red-600 dark:text-red-400",
    decrease: "text-green-600 dark:text-green-400",
  };

  const suffixText = type === "discount" ? "% off" : suffix;

  // Determine if icon shows up or down
  const showUpIcon = type === "increase" || (type === "neutral" && isPositive);
  const showDownIcon =
    type === "decrease" ||
    type === "discount" ||
    (type === "neutral" && isNegative);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium",
        colorClasses[type],
        className
      )}
    >
      {showIcon && (
        <>
          {showUpIcon && <TrendingUp className="w-4 h-4" />}
          {showDownIcon && <TrendingDown className="w-4 h-4" />}
        </>
      )}
      {sign}
      {isNegative && "-"}
      {formattedValue}
      {suffixText}
    </span>
  );
}

export default Percentage;
