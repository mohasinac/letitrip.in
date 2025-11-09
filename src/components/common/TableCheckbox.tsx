"use client";

import { useEffect, useRef } from "react";
import { TableCheckboxProps } from "@/types/inline-edit";

export function TableCheckbox({
  checked,
  onChange,
  indeterminate,
  disabled,
  label,
}: TableCheckboxProps) {
  const checkboxRef = useRef<HTMLInputElement>(null);

  // Set indeterminate state (can't be done via JSX)
  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = indeterminate || false;
    }
  }, [indeterminate]);

  return (
    <label className="flex items-center cursor-pointer min-w-[44px] min-h-[44px] justify-center">
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={label || (indeterminate ? "Select all" : checked ? "Deselect" : "Select")}
      />
    </label>
  );
}
