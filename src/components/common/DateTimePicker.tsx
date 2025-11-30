"use client";

import React, { useState, useMemo, useCallback } from "react";

/**
 * Date Time Picker Component
 * For selecting dates and times (publish dates, auction end times, etc.)
 * Supports date-only, time-only, and datetime modes
 */

type DateTimeMode = "date" | "time" | "datetime";

interface DateTimePickerProps {
  id?: string;
  value: Date | null;
  onChange: (date: Date | null) => void;
  mode?: DateTimeMode;
  minDate?: Date;
  maxDate?: Date;
  minTime?: string; // Format: "HH:mm"
  maxTime?: string; // Format: "HH:mm"
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  showClear?: boolean;
  use12Hour?: boolean;
  className?: string;
}

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

export default function DateTimePicker({
  value,
  onChange,
  mode = "datetime",
  minDate,
  maxDate,
  minTime,
  maxTime,
  placeholder = "Select date/time",
  disabled = false,
  error,
  showClear = true,
  use12Hour = false,
  className = "",
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());

  // Format display value
  const displayValue = useMemo(() => {
    if (!value) return "";

    const dateStr = value.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const timeStr = value.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: use12Hour,
    });

    if (mode === "date") return dateStr;
    if (mode === "time") return timeStr;
    return `${dateStr} ${timeStr}`;
  }, [value, mode, use12Hour]);

  // Get calendar days for current month
  const calendarDays = useMemo(() => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - startDate.getDay()); // Start from Sunday

    const days: (Date | null)[] = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      // 6 weeks
      if (current.getMonth() === month) {
        days.push(new Date(current));
      } else {
        days.push(null);
      }
      current.setDate(current.getDate() + 1);
    }

    return days;
  }, [viewDate]);

  // Check if date is disabled
  const isDateDisabled = useCallback(
    (date: Date | null) => {
      if (!date) return true;
      if (minDate && date < minDate) return true;
      if (maxDate && date > maxDate) return true;
      return false;
    },
    [minDate, maxDate]
  );

  // Check if date is selected
  const isDateSelected = useCallback(
    (date: Date | null) => {
      if (!date || !value) return false;
      return (
        date.getDate() === value.getDate() &&
        date.getMonth() === value.getMonth() &&
        date.getFullYear() === value.getFullYear()
      );
    },
    [value]
  );

  // Check if date is today
  const isToday = useCallback((date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  }, []);

  // Handle date selection
  const handleDateSelect = useCallback(
    (date: Date) => {
      if (isDateDisabled(date)) return;

      const newDate = new Date(date);
      if (value && mode === "datetime") {
        // Preserve time
        newDate.setHours(value.getHours(), value.getMinutes(), 0, 0);
      } else {
        newDate.setHours(0, 0, 0, 0);
      }

      onChange(newDate);

      if (mode === "date") {
        setIsOpen(false);
      }
    },
    [value, mode, isDateDisabled, onChange]
  );

  // Handle time change
  const handleTimeChange = useCallback(
    (hours: number, minutes: number) => {
      const newDate = value ? new Date(value) : new Date();
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    },
    [value, onChange]
  );

  // Navigate month
  const navigateMonth = useCallback((direction: "prev" | "next") => {
    setViewDate((prev) => {
      const newDate = new Date(prev);
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
      return newDate;
    });
  }, []);

  // Handle clear
  const handleClear = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
      setIsOpen(false);
    },
    [onChange]
  );

  // Get time values
  const hours = value?.getHours() ?? 0;
  const minutes = value?.getMinutes() ?? 0;

  return (
    <div className={`datetime-picker relative ${className}`}>
      {/* Input trigger */}
      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={(e) => e.key === "Enter" && !disabled && setIsOpen(!isOpen)}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className={`
          flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer
          ${
            disabled
              ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed"
              : "bg-white dark:bg-gray-800"
          }
          ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
          ${isOpen ? "ring-2 ring-blue-500" : ""}
        `}
      >
        {/* Calendar icon */}
        <svg
          className="w-5 h-5 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>

        {/* Display value */}
        <span
          className={`flex-1 ${
            value
              ? "text-gray-900 dark:text-white"
              : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {displayValue || placeholder}
        </span>

        {/* Clear button */}
        {showClear && value && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Picker dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            onKeyDown={(e) => e.key === "Escape" && setIsOpen(false)}
            role="button"
            tabIndex={-1}
            aria-label="Close date picker"
          />

          {/* Picker content */}
          <div className="absolute z-20 mt-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg p-4 min-w-[300px]">
            {/* Calendar (for date/datetime modes) */}
            {(mode === "date" || mode === "datetime") && (
              <div className="mb-4">
                {/* Month/Year header */}
                <div className="flex items-center justify-between mb-4">
                  <button
                    type="button"
                    onClick={() => navigateMonth("prev")}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 19l-7-7 7-7"
                      />
                    </svg>
                  </button>

                  <span className="font-semibold text-gray-900 dark:text-white">
                    {MONTHS[viewDate.getMonth()]} {viewDate.getFullYear()}
                  </span>

                  <button
                    type="button"
                    onClick={() => navigateMonth("next")}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-gray-700 dark:text-gray-300"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
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

                {/* Day labels */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-semibold text-gray-600 dark:text-gray-400"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((date, index) => {
                    const selected = isDateSelected(date);
                    const today = isToday(date);
                    const disabled = isDateDisabled(date);

                    return (
                      <button
                        key={index}
                        type="button"
                        onClick={() =>
                          date && !disabled && handleDateSelect(date)
                        }
                        disabled={!date || disabled}
                        className={`
                          w-8 h-8 text-sm rounded
                          ${!date ? "invisible" : ""}
                          ${
                            selected
                              ? "bg-blue-600 text-white font-semibold"
                              : ""
                          }
                          ${
                            today && !selected
                              ? "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                              : ""
                          }
                          ${
                            disabled
                              ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                              : !selected
                              ? "text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700"
                              : ""
                          }
                        `}
                      >
                        {date?.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Time picker (for time/datetime modes) */}
            {(mode === "time" || mode === "datetime") && (
              <div className="flex items-center gap-2 justify-center">
                {/* Hours */}
                <input
                  type="number"
                  min={0}
                  max={use12Hour ? 12 : 23}
                  value={use12Hour ? hours % 12 || 12 : hours}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (use12Hour) {
                      const newHours = hours >= 12 ? val + 12 : val;
                      handleTimeChange(newHours, minutes);
                    } else {
                      handleTimeChange(val, minutes);
                    }
                  }}
                  className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />

                <span className="font-semibold text-gray-900 dark:text-white">
                  :
                </span>

                {/* Minutes */}
                <input
                  type="number"
                  min={0}
                  max={59}
                  value={minutes.toString().padStart(2, "0")}
                  onChange={(e) =>
                    handleTimeChange(hours, parseInt(e.target.value, 10))
                  }
                  className="w-16 px-2 py-1 text-center border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />

                {/* AM/PM */}
                {use12Hour && (
                  <select
                    value={hours >= 12 ? "PM" : "AM"}
                    onChange={(e) => {
                      const isPM = e.target.value === "PM";
                      const newHours = isPM ? (hours % 12) + 12 : hours % 12;
                      handleTimeChange(newHours, minutes);
                    }}
                    className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {/* Error message */}
      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
