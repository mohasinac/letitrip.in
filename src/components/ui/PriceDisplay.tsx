import { formatCurrency, formatPercentage } from "@/utils";
import { classNames } from "@/helpers";

export interface PriceDisplayProps {
  amount: number;
  /** Currency code passed to formatCurrency. Default: "INR" */
  currency?: string;
  /** If provided, renders the original price with a strikethrough and a discount badge */
  originalAmount?: number;
  /** 'compact' = smaller text, 'detail' = larger prominent text. Default: 'compact' */
  variant?: "compact" | "detail";
  className?: string;
}

export function PriceDisplay({
  amount,
  currency = "INR",
  originalAmount,
  variant = "compact",
  className,
}: PriceDisplayProps) {
  const hasDiscount = originalAmount !== undefined && originalAmount > amount;

  const discountPct = hasDiscount
    ? Math.round(((originalAmount! - amount) / originalAmount!) * 100)
    : 0;

  const priceClass =
    variant === "detail"
      ? "text-xl font-bold text-indigo-600 dark:text-indigo-400"
      : "text-base font-bold text-indigo-600 dark:text-indigo-400";

  const originalClass =
    variant === "detail"
      ? "text-sm line-through text-gray-400 dark:text-gray-500"
      : "text-xs line-through text-gray-400 dark:text-gray-500";

  return (
    <div className={classNames("flex items-baseline flex-wrap gap-1.5", className)}>
      <span className={priceClass}>{formatCurrency(amount, currency)}</span>
      {hasDiscount && (
        <>
          <span className={originalClass}>
            {formatCurrency(originalAmount!, currency)}
          </span>
          <span className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1 py-0.5 rounded">
            -{formatPercentage(discountPct / 100, 0)}
          </span>
        </>
      )}
    </div>
  );
}
