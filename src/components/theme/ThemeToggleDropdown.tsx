/**
 * ThemeToggleDropdown Component
 *
 * Advanced theme toggle with dropdown menu for light, dark modes.
 * Modern UI with smooth animations and icons.
 *
 * @example
 * ```tsx
 * <ThemeToggleDropdown />
 * ```
 */

"use client";

import { useAppTheme } from "@/hooks/useTheme";
import { Check, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggleDropdown() {
  const { theme, setTheme, isDark, mounted } = useAppTheme();
  const [isOpen, setIsOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-theme-dropdown]")) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isOpen]);

  if (!mounted) {
    return (
      <button
        type="button"
        className="relative p-2.5 rounded-lg bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 transition-all duration-200"
        aria-label="Toggle theme"
      >
        <div className="w-5 h-5" />
      </button>
    );
  }

  const themes = [
    {
      value: "light",
      label: "Light",
      icon: Sun,
      description: "Light mode",
    },
    {
      value: "dark",
      label: "Dark",
      icon: Moon,
      description: "Dark mode (default)",
    },
  ];

  return (
    <div className="relative" data-theme-dropdown>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-lg bg-zinc-800/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 dark:border-zinc-700/50 hover:bg-zinc-700/50 dark:hover:bg-zinc-700/70 transition-all duration-200 group"
        aria-label="Toggle theme"
        aria-expanded={isOpen}
      >
        <div className="relative w-5 h-5">
          {/* Sun icon for light mode */}
          <Sun
            className={`absolute inset-0 w-5 h-5 text-amber-400 transition-all duration-300 ${
              isDark
                ? "rotate-90 scale-0 opacity-0"
                : "rotate-0 scale-100 opacity-100"
            }`}
          />
          {/* Moon icon for dark mode */}
          <Moon
            className={`absolute inset-0 w-5 h-5 text-sky-400 transition-all duration-300 ${
              isDark
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-0 opacity-0"
            }`}
          />
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-sky-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-zinc-900/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-700/50 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-1">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isSelected = theme === themeOption.value;

              return (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 ${
                    isSelected
                      ? "bg-sky-500/20 text-sky-400"
                      : "text-zinc-300 hover:bg-zinc-800/50 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium">
                      {themeOption.label}
                    </div>
                    <div className="text-xs text-zinc-500">
                      {themeOption.description}
                    </div>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 flex-shrink-0 text-sky-400" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Current Theme Indicator */}
          <div className="border-t border-zinc-800 px-3 py-2 bg-zinc-950/50">
            <div className="text-xs text-zinc-500">
              Current:{" "}
              <span className="text-zinc-300 font-medium capitalize">
                {theme}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
