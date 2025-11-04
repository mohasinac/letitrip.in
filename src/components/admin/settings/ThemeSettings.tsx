"use client";

import React from "react";
import { useModernTheme } from '@/lib/contexts/ModernThemeContext";

export default function ThemeSettings() {
  const { themeName, setTheme, mode } = useModernTheme();

  const themeOptions = [
    {
      id: "default" as const,
      label: "Default Theme",
      description:
        "Original blue & gray theme with clean white/black backgrounds",
    },
    {
      id: "custom" as const,
      label: "Custom Theme",
      description: `Wind pattern with ${
        mode === "light"
          ? "blood red & royal blue colors"
          : "fire red & light green colors with galaxy starry background"
      }`,
    },
  ];

  const handleThemeChange = (newTheme: "default" | "custom") => {
    setTheme(newTheme);
  };

  return (
    <div className="rounded-lg shadow-lg bg-white dark:bg-gray-800">
      <div className="border-b border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800">
        <h3 className="text-xl font-semibold mb-1">Theme Settings</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Select your preferred theme palette. Changes apply immediately across
          the entire application.
        </p>
      </div>
      <div className="p-6">
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-800 dark:text-blue-200">
          Your theme preference is saved and will persist across sessions. Admin
          can manage themes for all users.
        </div>

        <h6 className="text-lg font-semibold mb-4">Choose Theme</h6>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          {themeOptions.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeChange(theme.id)}
              className={`flex-1 min-h-[120px] flex flex-col items-start justify-start p-4 rounded-lg border-2 text-left transition-all ${
                themeName === theme.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-transparent text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              <h6
                className={`font-bold mb-2 ${
                  themeName === theme.id
                    ? "text-white"
                    : "text-gray-900 dark:text-white"
                }`}
              >
                {theme.label}
              </h6>
              <p
                className={`text-sm ${
                  themeName === theme.id
                    ? "text-white/80"
                    : "text-gray-600 dark:text-gray-400"
                }`}
              >
                {theme.description}
              </p>
              {themeName === theme.id && (
                <p className="mt-auto font-semibold text-white text-sm">
                  ✓ Active
                </p>
              )}
            </button>
          ))}
        </div>

        <hr className="my-6 border-gray-200 dark:border-gray-700" />

        <h6 className="text-base font-semibold mb-4">Theme Details</h6>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-100 dark:bg-gray-900 rounded-lg">
          {themeName === "default" ? (
            <>
              <div>
                <p className="text-sm font-semibold mb-1">Light Mode</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  • White background
                  <br />• Blue primary color
                  <br />• Clean, minimal design
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Dark Mode</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  • Pure black background
                  <br />• Blue primary color
                  <br />• High contrast text
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <p className="text-sm font-semibold mb-1">Light Mode</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  • White wind pattern
                  <br />• Royal blue & blood red
                  <br />• Dynamic geometric design
                </p>
              </div>
              <div>
                <p className="text-sm font-semibold mb-1">Dark Mode</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  • Galaxy starry background
                  <br />• Fire red & light green
                  <br />• Cosmic theme
                </p>
              </div>
            </>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Selected Theme: <strong>{themeName.toUpperCase()}</strong>
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Current Mode: <strong>{mode.toUpperCase()}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}
