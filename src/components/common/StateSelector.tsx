/**
 * @fileoverview React Component
 * @module src/components/common/StateSelector
 * @description This file contains the StateSelector component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import React from "react";
import { SearchableDropdown } from "./SearchableDropdown";
import { ALL_INDIAN_STATES } from "@/constants/location";

/**
 * StateSelectorProps interface
 * 
 * @interface
 * @description Defines the structure and contract for StateSelectorProps
 */
export interface StateSelectorProps {
  /** Value */
  value: string;
  /** On Change */
  onChange: (value: string) => void;
  /** Disabled */
  disabled?: boolean;
  /** Required */
  required?: boolean;
  /** Error */
  error?: string;
  /** Label */
  label?: string;
  /** Placeholder */
  placeholder?: string;
  /** Class Name */
  className?: string;
  /** Id */
  id?: string;
  /** Name */
  name?: string;
}

// Transform states to dropdown options
/**
 * Performs state options operation
 *
 * @param {any} (state - The (state
 *
 * @returns {any} The stateoptions result
 *
 */
const stateOptions = ALL_INDIAN_STATES.map((state) => ({
  /** Value */
  value: state,
  /** Label */
  label: state,
}));

/**
 * Function: State Selector
 */
/**
 * Performs state selector operation
 *
 * @returns {any} The stateselector result
 *
 * @example
 * StateSelector();
 */

/**
 * Performs state selector operation
 *
 * @returns {any} The stateselector result
 *
 * @example
 * StateSelector();
 */

export function StateSelector({
  value,
  onChange,
  disabled = false,
  required = false,
  error,
  label = "State",
  placeholder = "Select state",
  className = "",
  id,
  name,
}: StateSelectorProps) {
  return (
    <SearchableDropdown
      options={stateOptions}
      value={value}
      onChange={(val) => onChange(val as string)}
      mode="single"
      searchable
      clearable
      disabled={disabled}
      required={required}
      error={error}
      label={label}
      placeholder={placeholder}
      searchPlaceholder="Search states..."
      noResultsText="No states found"
      className={className}
      id={id}
      name={name}
    />
  );
}

export default StateSelector;
