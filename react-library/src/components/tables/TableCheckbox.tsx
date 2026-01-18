
import { useEffect, useRef } from "react";

export interface TableCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  indeterminate?: boolean;
  disabled?: boolean;
  label?: string;
}

/**
 * TableCheckbox component for use in data tables
 * Supports indeterminate state for "select all" functionality
 * Touch-friendly with minimum 44x44px touch target
 */
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      onChange(e.target.checked);
    }
  };

  return (
    <label className="flex items-center cursor-pointer min-w-[44px] min-h-[44px] justify-center">
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label={
          label ||
          (indeterminate ? "Select all" : checked ? "Deselect" : "Select")
        }
      />
    </label>
  );
}
