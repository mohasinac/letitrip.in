"use client";

import { cn } from "../../utils/cn";
import { forwardRef, InputHTMLAttributes, useEffect, useState } from "react";

// Helper functions for date manipulation
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const getFirstDayOfMonth = (year: number, month: number) => {
  return new Date(year, month, 1).getDay();
};

const formatDate = (date: Date | null): string => {
  if (!date) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const parseDate = (dateString: string): Date | null => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export interface FormDatePickerProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    "size" | "value" | "onChange" | "type"
  > {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  compact?: boolean;
  /**
   * Date value (Date object or ISO string)
   */
  value?: Date | string | null;
  /**
   * Callback when date changes
   */
  onChange?: (date: Date | null) => void;
  /**
   * Minimum date (Date object or ISO string)
   */
  minDate?: Date | string;
  /**
   * Maximum date (Date object or ISO string)
   */
  maxDate?: Date | string;
  /**
   * Format for display in input
   * @default "YYYY-MM-DD"
   */
  displayFormat?: "YYYY-MM-DD" | "DD/MM/YYYY" | "MM/DD/YYYY";
  /**
   * Show calendar icon
   * @default true
   */
  showIcon?: boolean;
  /**
   * Placeholder text
   */
  placeholder?: string;
}

export const FormDatePicker = forwardRef<HTMLInputElement, FormDatePickerProps>(
  (
    {
      label,
      error,
      helperText,
      className,
      fullWidth = true,
      compact = false,
      id,
      value,
      onChange,
      minDate,
      maxDate,
      displayFormat = "YYYY-MM-DD",
      showIcon = true,
      placeholder,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(() => {
      if (!value) return null;
      if (value instanceof Date) return value;
      return parseDate(value);
    });

    // Current view state for calendar
    const [viewYear, setViewYear] = useState(() => {
      return selectedDate?.getFullYear() ?? new Date().getFullYear();
    });
    const [viewMonth, setViewMonth] = useState(() => {
      return selectedDate?.getMonth() ?? new Date().getMonth();
    });

    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");
    const hasError = Boolean(error);

    // Parse min/max dates
    const minDateObj = minDate
      ? minDate instanceof Date
        ? minDate
        : parseDate(minDate)
      : null;
    const maxDateObj = maxDate
      ? maxDate instanceof Date
        ? maxDate
        : parseDate(maxDate)
      : null;

    // Update selected date when value prop changes
    useEffect(() => {
      if (!value) {
        setSelectedDate(null);
      } else if (value instanceof Date) {
        setSelectedDate(value);
      } else {
        setSelectedDate(parseDate(value));
      }
    }, [value]);

    const formatDisplayDate = (date: Date | null): string => {
      if (!date) return "";

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      switch (displayFormat) {
        case "DD/MM/YYYY":
          return `${day}/${month}/${year}`;
        case "MM/DD/YYYY":
          return `${month}/${day}/${year}`;
        default:
          return `${year}-${month}-${day}`;
      }
    };

    const isDateDisabled = (date: Date): boolean => {
      if (minDateObj && date < minDateObj) return true;
      if (maxDateObj && date > maxDateObj) return true;
      return false;
    };

    const handleDateSelect = (day: number) => {
      const newDate = new Date(viewYear, viewMonth, day);

      if (isDateDisabled(newDate)) return;

      setSelectedDate(newDate);
      onChange?.(newDate);
      setIsOpen(false);
    };

    const handlePreviousMonth = () => {
      if (viewMonth === 0) {
        setViewMonth(11);
        setViewYear(viewYear - 1);
      } else {
        setViewMonth(viewMonth - 1);
      }
    };

    const handleNextMonth = () => {
      if (viewMonth === 11) {
        setViewMonth(0);
        setViewYear(viewYear + 1);
      } else {
        setViewMonth(viewMonth + 1);
      }
    };

    const handleToday = () => {
      const today = new Date();
      if (!isDateDisabled(today)) {
        setSelectedDate(today);
        onChange?.(today);
        setIsOpen(false);
      }
    };

    const handleClear = () => {
      setSelectedDate(null);
      onChange?.(null);
      setIsOpen(false);
    };

    // Generate calendar days
    const renderCalendar = () => {
      const daysInMonth = getDaysInMonth(viewYear, viewMonth);
      const firstDay = getFirstDayOfMonth(viewYear, viewMonth);
      const days: (number | null)[] = [];

      // Add empty cells for days before month starts
      for (let i = 0; i < firstDay; i++) {
        days.push(null);
      }

      // Add days of month
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
      }

      return days;
    };

    const calendarDays = renderCalendar();
    const today = new Date();
    const isToday = (day: number) => {
      return (
        day === today.getDate() &&
        viewMonth === today.getMonth() &&
        viewYear === today.getFullYear()
      );
    };

    const isSelected = (day: number) => {
      if (!selectedDate) return false;
      return (
        day === selectedDate.getDate() &&
        viewMonth === selectedDate.getMonth() &&
        viewYear === selectedDate.getFullYear()
      );
    };

    return (
      <div className={cn("flex flex-col", fullWidth && "w-full", className)}>
        {/* Label */}
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              "mb-1.5 text-sm font-medium text-gray-700",
              hasError && "text-red-600",
              compact && "mb-1 text-xs"
            )}
          >
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          <div className="relative flex">
            <input
              ref={ref}
              type="text"
              id={inputId}
              value={formatDisplayDate(selectedDate)}
              readOnly
              onClick={() => !disabled && setIsOpen(!isOpen)}
              disabled={disabled}
              placeholder={placeholder || "Select date"}
              className={cn(
                "flex-1 px-4 py-2.5 border rounded-lg",
                "bg-white text-gray-900 placeholder-gray-400",
                "cursor-pointer",
                "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-500",
                "transition-colors",
                hasError &&
                  "border-red-300 focus:ring-red-500 focus:border-red-300",
                !hasError && "border-gray-300",
                showIcon && "pr-10",
                compact && "py-1.5 text-sm"
              )}
              {...props}
            />

            {/* Calendar Icon */}
            {showIcon && (
              <button
                type="button"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                disabled={disabled}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </button>
            )}
          </div>

          {/* Calendar Dropdown */}
          {isOpen && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />

              {/* Calendar */}
              <div className="absolute z-20 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 p-4 w-80">
                {/* Header with month/year navigation */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={handlePreviousMonth}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <div className="font-semibold text-gray-900">
                    {MONTHS[viewMonth]} {viewYear}
                  </div>

                  <button
                    type="button"
                    onClick={handleNextMonth}
                    className="p-1 hover:bg-gray-100 rounded"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {/* Day headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="text-xs font-medium text-gray-500 text-center py-1"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day, index) => {
                    if (day === null) {
                      return <div key={`empty-${index}`} />;
                    }

                    const date = new Date(viewYear, viewMonth, day);
                    const disabled = isDateDisabled(date);

                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDateSelect(day)}
                        disabled={disabled}
                        className={cn(
                          "p-2 text-sm rounded hover:bg-gray-100 transition-colors",
                          isSelected(day) &&
                            "bg-blue-600 text-white hover:bg-blue-700",
                          isToday(day) &&
                            !isSelected(day) &&
                            "border border-blue-600 text-blue-600",
                          disabled &&
                            "text-gray-300 cursor-not-allowed hover:bg-transparent"
                        )}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Footer with actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleToday}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={handleClear}
                    className="text-sm text-gray-600 hover:text-gray-700"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Helper Text / Error */}
        {(helperText || error) && (
          <p
            className={cn(
              "mt-1.5 text-sm",
              hasError ? "text-red-600" : "text-gray-500",
              compact && "mt-1 text-xs"
            )}
          >
            {error || helperText}
          </p>
        )}

        {/* Date Range Hint */}
        {(minDateObj || maxDateObj) && !hasError && (
          <p className="mt-1 text-xs text-gray-500">
            {minDateObj && maxDateObj
              ? `Valid range: ${formatDisplayDate(
                  minDateObj
                )} to ${formatDisplayDate(maxDateObj)}`
              : minDateObj
              ? `From: ${formatDisplayDate(minDateObj)}`
              : `Until: ${formatDisplayDate(maxDateObj)}`}
          </p>
        )}
      </div>
    );
  }
);

FormDatePicker.displayName = "FormDatePicker";
