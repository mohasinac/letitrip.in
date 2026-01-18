/**
 * Price Display Component
 *
 * Displays prices in Indian Rupees with proper formatting.
 * Use this instead of manual ₹ formatting throughout the app.
 *
 * @example
 * <Price amount={1499.99} />                    // ₹1,499.99
 * <Price amount={1499} showDecimals={false} />  // ₹1,499
 * <Price amount={1499} originalPrice={1999} />  // ₹1,499 (strikethrough ₹1,999)
 * <CompactPrice amount={150000} />              // ₹1.5L
 */


import { cn } from "../../utils/cn";
import { formatCompactCurrency } from "../../utils/formatters";
import { formatDiscount, formatPrice } from "../../utils/price.utils";

interface PriceProps {
  amount: number;
  originalPrice?: number;
  showDecimals?: boolean;
  showSymbol?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  strikethroughClassName?: string;
  showDiscount?: boolean;
}

const sizeClasses = {
  xs: "text-xs",
  sm: "text-sm",
  md: "text-base",
  lg: "text-lg",
  xl: "text-xl",
};

export function Price({
  amount,
  originalPrice,
  showDecimals = false,
  showSymbol = true,
  size = "md",
  className,
  strikethroughClassName,
  showDiscount = true,
}: PriceProps) {
  const formattedPrice = formatPrice(amount, {
    showDecimals,
    showSymbol: showSymbol,
  });
  const hasDiscount = originalPrice && originalPrice > amount;
  const discountPercent = hasDiscount
    ? formatDiscount(originalPrice, amount)
    : null;

  return (
    <span
      className={cn("inline-flex items-baseline gap-2 flex-wrap", className)}
    >
      <span
        className={cn(
          "font-semibold text-gray-900 dark:text-white",
          sizeClasses[size]
        )}
      >
        {formattedPrice}
      </span>

      {hasDiscount && (
        <>
          <span
            className={cn(
              "line-through text-gray-500 dark:text-gray-400",
              size === "xl"
                ? "text-base"
                : size === "lg"
                ? "text-sm"
                : "text-xs",
              strikethroughClassName
            )}
          >
            {formatPrice(originalPrice, {
              showDecimals,
              showSymbol: showSymbol,
            })}
          </span>

          {showDiscount && discountPercent && (
            <span className="text-green-600 dark:text-green-400 text-xs font-medium">
              {discountPercent} off
            </span>
          )}
        </>
      )}
    </span>
  );
}

interface CompactPriceProps {
  amount: number;
  className?: string;
}

export function CompactPrice({ amount, className }: CompactPriceProps) {
  return (
    <span
      className={cn("font-semibold text-gray-900 dark:text-white", className)}
    >
      {formatCompactCurrency(amount)}
    </span>
  );
}
