/**
 * @fileoverview React Component
 * @module src/components/admin/homepage/SliderControl
 * @description This file contains the SliderControl component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { FormLabel } from "@/components/forms/FormLabel";

/**
 * SliderControlProps interface
 * 
 * @interface
 * @description Defines the structure and contract for SliderControlProps
 */
interface SliderControlProps {
  /** Label */
  label: string;
  /** Value */
  value: number;
  /** Min */
  min: number;
  /** Max */
  max: number;
  /** On Change */
  onChange: (value: number) => void;
}

/**
 * Function: Slider Control
 */
/**
 * Performs slider control operation
 *
 * @returns {any} The slidercontrol result
 *
 * @example
 * SliderControl();
 */

/**
 * Performs slider control operation
 *
 * @returns {any} The slidercontrol result
 *
 * @example
 * SliderControl();
 */

export function SliderControl({
  label,
  value,
  min,
  max,
  onChange,
}: SliderControlProps) {
  return (
    <div>
      <FormLabel>
        {label}: {value}
      </FormLabel>
      <input
        type="range"
        min={min}
        max={max}
        step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer"
      />
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}
