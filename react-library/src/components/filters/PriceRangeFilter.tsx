"use client";

/**
 * PriceRangeFilter Component
 *
 * Specialized range input for price filtering with currency symbol.
 * Shows min/max inputs with currency prefix and displays selected range.
 *
 * @example
 * ```tsx
 * <PriceRangeFilter
 *   min={0}
 *   max={100000}
 *   value={{ min: '1000', max: '5000' }}
 *   onChange={(value) => setPrice(value)}
 *   currency="₹"
 * />
 * ```
 */

import { useEffect, useState } from "react";

export interface PriceRangeFilterProps {
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Current value object */
  value?: { min?: string; max?: string };
  /** Callback when value changes */
  onChange: (value: { min?: string; max?: string }) => void;
  /** Currency symbol to display */
  currency?: string;
  /** Step value for number inputs */
  step?: number;
  /** Placeholder text for min/max inputs */
  placeholder?: { min?: string; max?: string };
}

export const PriceRangeFilter: React.FC<PriceRangeFilterProps> = ({
  min = 0,
  max,
  value = {},
  onChange,
  currency = "₹",
  step = 1,
  placeholder = { min: "Min", max: "Max" },
}) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = { ...localValue, min: e.target.value };
    setLocalValue(newValue);
    onChange(newValue);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = { ...localValue, max: e.target.value };
    setLocalValue(newValue);
    onChange(newValue);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
            {currency}
          </span>
          <input
            type="number"
            value={localValue.min || ""}
            onChange={handleMinChange}
            placeholder={placeholder.min}
            min={min}
            max={max}
            step={step}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <span className="text-gray-500 dark:text-gray-400 text-sm">-</span>
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 text-sm">
            {currency}
          </span>
          <input
            type="number"
            value={localValue.max || ""}
            onChange={handleMaxChange}
            placeholder={placeholder.max}
            min={min}
            max={max}
            step={step}
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
      </div>
      {(localValue.min || localValue.max) && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {localValue.min && localValue.max
            ? `${currency}${localValue.min} - ${currency}${localValue.max}`
            : localValue.min
            ? `From ${currency}${localValue.min}`
            : `Up to ${currency}${localValue.max}`}
        </p>
      )}
    </div>
  );
};

export default PriceRangeFilter;
