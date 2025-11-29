"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, Theme } from "@/contexts/ThemeContext";

// Icons as inline SVGs to avoid dependencies
const SunIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

interface ThemeOption {
  value: Theme;
  label: string;
  icon: React.ReactNode;
}

const themeOptions: ThemeOption[] = [
  { value: "light", label: "Light", icon: <SunIcon className="w-4 h-4" /> },
  { value: "dark", label: "Dark", icon: <MoonIcon className="w-4 h-4" /> },
];

interface ThemeToggleProps {
  /** Variant style */
  variant?: "button" | "dropdown";
  /** Additional CSS classes */
  className?: string;
  /** Show label text */
  showLabel?: boolean;
  /** Size of the toggle */
  size?: "sm" | "md" | "lg";
}

/**
 * ThemeToggle Component
 *
 * A button that cycles through themes (button variant) or
 * shows a dropdown with all theme options (dropdown variant).
 *
 * @example
 * // Simple toggle button
 * <ThemeToggle />
 *
 * // Dropdown with label
 * <ThemeToggle variant="dropdown" showLabel />
 */
export function ThemeToggle({
  variant = "button",
  className = "",
  showLabel = false,
  size = "md",
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (variant === "dropdown") {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
      if (event.key === "ArrowDown" && !isOpen) {
        setIsOpen(true);
        event.preventDefault();
      }
    }
  };

  // Get current icon based on theme
  const getCurrentIcon = () => {
    return theme === "light" ? (
      <SunIcon className={iconSizeClass} />
    ) : (
      <MoonIcon className={iconSizeClass} />
    );
  };

  // Toggle between light and dark
  const cycleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
  };

  // Size classes
  const sizeClasses = {
    sm: "p-1.5",
    md: "p-2",
    lg: "p-3",
  };

  const iconSizeClass = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  }[size];

  // Get current theme label
  const currentOption = themeOptions.find((opt) => opt.value === theme);

  // Base button styles
  const buttonStyles = `
    inline-flex items-center justify-center gap-2
    rounded-lg border border-gray-200 dark:border-gray-700
    bg-white dark:bg-gray-800
    text-gray-700 dark:text-gray-200
    hover:bg-gray-100 dark:hover:bg-gray-700
    focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500
    transition-colors duration-200
    ${sizeClasses[size]}
    ${className}
  `.trim();

  if (variant === "button") {
    return (
      <button
        ref={buttonRef}
        type="button"
        onClick={cycleTheme}
        className={buttonStyles}
        aria-label={`Current theme: ${currentOption?.label}. Click to change.`}
        title={`Theme: ${currentOption?.label}`}
      >
        <span className="transition-transform duration-200">
          {getCurrentIcon()}
        </span>
        {showLabel && (
          <span className="text-sm font-medium">{currentOption?.label}</span>
        )}
      </button>
    );
  }

  // Dropdown variant
  return (
    <div ref={dropdownRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className={buttonStyles}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-label={`Theme: ${currentOption?.label}. Click to change.`}
      >
        <span className="transition-transform duration-200">
          {getCurrentIcon()}
        </span>
        {showLabel && (
          <span className="text-sm font-medium">{currentOption?.label}</span>
        )}
        <svg
          className={`w-4 h-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Select theme"
          className="
            absolute right-0 mt-2 w-40 py-1
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-lg shadow-lg
            z-50
          "
        >
          {themeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={theme === option.value}
              onClick={() => {
                setTheme(option.value);
                setIsOpen(false);
              }}
              className={`
                w-full px-4 py-2 text-left
                flex items-center gap-3
                text-sm
                ${
                  theme === option.value
                    ? "bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }
                transition-colors duration-150
              `}
            >
              <span
                className={
                  theme === option.value
                    ? "text-yellow-600 dark:text-yellow-400"
                    : ""
                }
              >
                {option.icon}
              </span>
              <span>{option.label}</span>
              {theme === option.value && (
                <svg
                  className="w-4 h-4 ml-auto text-yellow-600 dark:text-yellow-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;
