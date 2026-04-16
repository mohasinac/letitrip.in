"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import type { ThemeMode } from "@/constants/theme";

interface ThemeContextType {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  initialTheme = "light",
}: {
  children: React.ReactNode;
  initialTheme?: ThemeMode;
}) {
  // Always initialise with the server-provided value so SSR and the first
  // client render produce identical output — no hydration mismatch.
  const [theme, setThemeState] = useState<ThemeMode>(initialTheme);

  useEffect(() => {
    // After hydration, reconcile localStorage / system preference with the
    // cookie-driven value the server used.  This corrects any drift (e.g.
    // cookie cleared but localStorage still set, or first-time visitor).
    const savedTheme = localStorage.getItem("theme") as ThemeMode | null;
    if (savedTheme) {
      if (savedTheme !== initialTheme) {
        setThemeState(savedTheme);
        applyTheme(savedTheme);
        document.cookie = `theme=${savedTheme}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)")
        .matches
        ? "dark"
        : "light";
      setThemeState(systemTheme);
      applyTheme(systemTheme);
      localStorage.setItem("theme", systemTheme);
      document.cookie = `theme=${systemTheme}; path=/; max-age=31536000; SameSite=Lax`;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyTheme = useCallback((newTheme: ThemeMode) => {
    const root = document.documentElement;

    if (newTheme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    root.setAttribute("data-theme", newTheme);
  }, []);

  const setTheme = useCallback(
    (newTheme: ThemeMode) => {
      setThemeState(newTheme);
      localStorage.setItem("theme", newTheme);
      // Write cookie so the server can render the correct class before hydration
      document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
      applyTheme(newTheme);
    },
    [applyTheme],
  );

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const newTheme = prev === "light" ? "dark" : "light";
      localStorage.setItem("theme", newTheme);
      document.cookie = `theme=${newTheme}; path=/; max-age=31536000; SameSite=Lax`;
      applyTheme(newTheme);
      return newTheme;
    });
  }, [applyTheme]);

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme }),
    [theme, toggleTheme, setTheme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

