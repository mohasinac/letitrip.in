"use client";

import React from "react";
import { SearchableDropdown } from "./SearchableDropdown";
import { ALL_INDIAN_STATES } from "@/constants/location";

export interface StateSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  label?: string;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
}

// Transform states to dropdown options
const stateOptions = ALL_INDIAN_STATES.map((state) => ({
  value: state,
  label: state,
}));

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
