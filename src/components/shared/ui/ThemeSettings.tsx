"use client";

import { useEffect } from "react";
import { Sun } from "lucide-react";

interface ThemeSettingsProps {
  className?: string;
  showTitle?: boolean;
}

/**
 * Theme Settings Component
 * Light Mode Only - Dark and System modes are disabled
 */
const ThemeSettings = ({
  className = "",
  showTitle = true,
}: ThemeSettingsProps) => {
  // Ensure light mode is always enabled
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }, []);

  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}
    >
      {showTitle && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Theme Settings
          </h3>
        </div>
      )}

      <div className="space-y-6">
        {/* Theme Mode - Light Only */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Appearance
          </label>
          <div className="inline-flex items-center space-x-2">
            <div
              className="
                flex flex-col items-center p-3 rounded-lg border-2
                border-primary bg-primary/10 text-primary
              "
            >
              <Sun className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">Light</span>
            </div>
            <p className="text-sm text-gray-600 ml-4">
              Light mode is currently enabled. Dark mode is not available.
            </p>
          </div>
        </div>

        {/* Current Theme Info */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 rounded-full bg-yellow-400"></div>
            <span>Using light theme</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeSettings;
