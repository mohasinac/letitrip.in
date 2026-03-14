import { formatCurrency, formatPercentage } from "@/utils";
import { classNames } from "@/helpers";
import { Span } from "@/components";

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
      ? "text-xl font-bold text-primary"
      : "text-base font-bold text-primary";

  const originalClass =
    variant === "detail"
      ? "text-sm line-through text-zinc-400 dark:text-zinc-500"
      : "text-xs line-through text-zinc-400 dark:text-zinc-500";

  return (
    <div
      className={classNames("flex items-baseline flex-wrap gap-1.5", className)}
    >
      <Span variant="inherit" className={priceClass}>
        {formatCurrency(amount, currency)}
      </Span>
      {hasDiscount && (
        <>
          <Span variant="inherit" className={originalClass}>
            {formatCurrency(originalAmount!, currency)}
          </Span>
          <Span
            variant="inherit"
            className="text-xs font-semibold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-1 py-0.5 rounded"
          >
            -{formatPercentage(discountPct / 100, 0)}
          </Span>
        </>
      )}
    </div>
  );
}
