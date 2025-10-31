"use client";

import React from "react";

interface FormSectionProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

/**
 * FormSection Component
 * Standardized section container for form groups
 * Provides consistent spacing and title styling
 */
export function FormSection({
  title,
  subtitle,
  children,
  className = "",
}: FormSectionProps) {
  return (
    <div className={className}>
      <h3 className="text-sm font-semibold mb-4 text-gray-900 dark:text-white">
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4 block">
          {subtitle}
        </p>
      )}
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

export default FormSection;
