"use client";

import { useEffect } from "react";
import { Sun } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

/**
 * Light Mode Only Theme Toggle
 * Currently only supports light mode. Toggle is hidden.
 * @deprecated This component is kept for backwards compatibility but does nothing.
 * Light mode is always enabled.
 */
const ThemeToggle = ({
  className = "",
  size = "md",
  showLabel = false,
}: ThemeToggleProps) => {
  // Ensure light mode is always set
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  // Component is hidden - light mode only
  return null;
};

export default ThemeToggle;
