"use client";

/**
 * ThemeToggle Component
 *
 * Modern theme toggle with smooth transitions and animations.
 * Toggles between light and dark mode with dark mode as default.
 *
 * @example
 * ```tsx
 * <ThemeToggle />
 * ```
 */

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // useEffect only runs on the client, so now we can safely show the UI
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return a placeholder with the same dimensions to avoid layout shift
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

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <button
      type="button"
      onClick={() => {
        const newTheme = isDark ? "light" : "dark";
        setTheme(newTheme);
        // Update html class immediately for instant feedback
        document.documentElement.classList.toggle("dark", newTheme === "dark");
      }}
      className="relative p-2.5 rounded-lg bg-zinc-800/50 dark:bg-zinc-800/50 backdrop-blur-sm border border-zinc-700/50 dark:border-zinc-700/50 hover:bg-zinc-700/50 dark:hover:bg-zinc-700/70 transition-all duration-200 group"
      aria-label="Toggle theme"
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
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
  );
}
