/**
 * Currency Display Component
 *
 * Displays currency values with proper symbol and formatting.
 * Supports multiple currencies with INR as default.
 *
 * @example
 * <Currency amount={1499} />              // ₹1,499
 * <Currency amount={1499} code="USD" />   // $1,499
 */


// React import not needed in React 17+ JSX transform
import { cn } from "../../utils/cn";

type CurrencyCode = "INR" | "USD" | "EUR" | "GBP";

interface CurrencyProps {
  amount: number;
  code?: CurrencyCode;
  showDecimals?: boolean;
  className?: string;
}

const currencyLocales: Record<CurrencyCode, string> = {
  INR: "en-IN",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
};

export function Currency({
  amount,
  code = "INR",
  showDecimals = false,
  className,
}: CurrencyProps) {
  const formatted = new Intl.NumberFormat(currencyLocales[code], {
    style: "currency",
    currency: code,
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);

  return (
    <span
      className={cn("font-medium text-gray-900 dark:text-white", className)}
    >
      {formatted}
    </span>
  );
}
