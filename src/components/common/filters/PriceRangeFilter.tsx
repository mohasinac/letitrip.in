/**
 * @fileoverview React Component
 * @module src/components/common/filters/PriceRangeFilter
 * @description This file contains the PriceRangeFilter component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { useEffect, useState } from "react";

/**
 * PriceRangeFilterProps interface
 * 
 * @interface
 * @description Defines the structure and contract for PriceRangeFilterProps
 */
export interface PriceRangeFilterProps {
  /** Min */
  min?: number;
  /** Max */
  max?: number;
  /** Value */
  value?: { min?: string; max?: string };
  /** On Change */
  onChange: (value: { min?: string; max?: string }) => void;
  /** Currency */
  currency?: string;
  /** Step */
  step?: number;
  /** Placeholder */
  placeholder?: { min?: string; max?: string };
}

/**
 * Function: Price Range Filter
 */
/**
 * Performs price range filter operation
 *
 * @returns {any} The pricerangefilter result
 *
 * @example
 * PriceRangeFilter();
 */

/**
 * Performs price range filter operation
 *
 * @returns {any} The pricerangefilter result
 *
 * @example
 * PriceRangeFilter();
 */

export function PriceRangeFilter({
  min = 0,
  max,
  value = {},
  onChange,
  currency = "₹",
  step = 1,
  placeholder = { min: "Min", max: "Max" },
}: Readonly<PriceRangeFilterProps>) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  /**
   * Handles min change event
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The e
   *
   * @returns {any} The handleminchange result
   */

  /**
   * Handles min change event
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The e
   *
   * @returns {any} The handleminchange result
   */

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = { ...localValue, min: e.target.value };
    setLocalValue(newValue);
    onChange(newValue);
  };

  /**
   * Handles max change event
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The e
   *
   * @returns {any} The handlemaxchange result
   */

  /**
   * Handles max change event
   *
   * @param {React.ChangeEvent<HTMLInputElement>} e - The e
   *
   * @returns {any} The handlemaxchange result
   */

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
      {localValue.min || localValue.max ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {localValue.min && localValue.max
            ? `${currency}${localValue.min} - ${currency}${localValue.max}`
            : localValue.min
              ? `From ${currency}${localValue.min}`
              : `Up to ${currency}${localValue.max}`}
        </p>
      ) : null}
    </div>
  );
}
