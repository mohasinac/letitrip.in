"use client";

/**
 * ThemeToggle Component
 *
 * Framework-agnostic theme toggle button with button and dropdown variants.
 * Requires injectable theme handler.
 *
 * @example
 * ```tsx
 * <ThemeToggle
 *   currentTheme="light"
 *   onThemeChange={(theme) => setTheme(theme)}
 *   variant="button"
 * />
 * ```
 */

import React, { useEffect, useRef, useState } from "react";

export type Theme = "light" | "dark";

export interface ThemeToggleProps {
  /** Current active theme */
  currentTheme: Theme;
  /** Theme change callback */
  onThemeChange: (theme: Theme) => void;
  /** Variant style */
  variant?: "button" | "dropdown";
  /** Show label text */
  showLabel?: boolean;
  /** Size of the toggle */
  size?: "sm" | "md" | "lg";
  /** Additional CSS classes */
  className?: string;
  /** Custom Sun icon */
  SunIcon?: React.ComponentType<{ className?: string }>;
  /** Custom Moon icon */
  MoonIcon?: React.ComponentType<{ className?: string }>;
}

// Inline cn utility
function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

// Default inline SVG icons
function DefaultSunIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
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
}

function DefaultMoonIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export function ThemeToggle({
  currentTheme,
  onThemeChange,
  variant = "button",
  showLabel = false,
  size = "md",
  className = "",
  SunIcon = DefaultSunIcon,
  MoonIcon = DefaultMoonIcon,
}: ThemeToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const themeOptions = [
    { value: "light" as Theme, label: "Light", icon: SunIcon },
    { value: "dark" as Theme, label: "Dark", icon: MoonIcon },
  ];

  // Close dropdown on outside click
  useEffect(() => {
    if (variant !== "dropdown") return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, variant]);

  const sizeClasses = {
    sm: "p-1.5 text-sm",
    md: "p-2 text-base",
    lg: "p-3 text-lg",
  };

  const iconSizes = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  if (variant === "button") {
    const toggleTheme = () => {
      const newTheme = currentTheme === "light" ? "dark" : "light";
      onThemeChange(newTheme);
    };

    const currentOption = themeOptions.find(
      (opt) => opt.value === currentTheme
    )!;
    const Icon = currentOption.icon;

    return (
      <button
        onClick={toggleTheme}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg",
          "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
          "hover:bg-gray-200 dark:hover:bg-gray-700",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500",
          sizeClasses[size],
          className
        )}
        aria-label={`Switch to ${
          currentTheme === "light" ? "dark" : "light"
        } mode`}
      >
        <Icon className={iconSizes[size]} />
        {showLabel && (
          <span className="font-medium">{currentOption.label}</span>
        )}
      </button>
    );
  }

  // Dropdown variant
  const currentOption = themeOptions.find((opt) => opt.value === currentTheme)!;
  const CurrentIcon = currentOption.icon;

  return (
    <div ref={dropdownRef} className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg",
          "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300",
          "hover:bg-gray-200 dark:hover:bg-gray-700",
          "transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500",
          sizeClasses[size]
        )}
        aria-label="Select theme"
        aria-expanded={isOpen}
      >
        <CurrentIcon className={iconSizes[size]} />
        {showLabel && (
          <span className="font-medium">{currentOption.label}</span>
        )}
        <svg
          className={cn(
            iconSizes[size],
            "transition-transform",
            isOpen && "rotate-180"
          )}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 right-0 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden min-w-[160px]">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = option.value === currentTheme;

            return (
              <button
                key={option.value}
                onClick={() => {
                  onThemeChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-2.5 text-sm",
                  "hover:bg-gray-100 dark:hover:bg-gray-700",
                  "transition-colors text-left",
                  isActive && "bg-gray-50 dark:bg-gray-700/50"
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="flex-1 font-medium">{option.label}</span>
                {isActive && (
                  <svg
                    className="w-4 h-4 text-blue-600 dark:text-blue-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default ThemeToggle;
