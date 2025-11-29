"use client";

import React from "react";

export interface CheckboxProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  "type"
> {
  label?: string;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, description, className = "", id, ...props }, ref) => {
    const checkboxId = id || label?.toLowerCase().replace(/\s+/g, "-");

    if (!label) {
      return (
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={`
            w-4 h-4 text-blue-600 border-gray-300 rounded
            focus:ring-blue-500 focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
      );
    }

    return (
      <label
        htmlFor={checkboxId}
        className="flex items-start gap-3 cursor-pointer group"
      >
        <input
          ref={ref}
          type="checkbox"
          id={checkboxId}
          className={`
            w-4 h-4 text-blue-600 border-gray-300 rounded mt-0.5
            focus:ring-blue-500 focus:ring-2
            disabled:opacity-50 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
            {label}
          </div>
          {description && (
            <div className="text-sm text-gray-500">{description}</div>
          )}
        </div>
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";
