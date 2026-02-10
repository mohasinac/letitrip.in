"use client";

import { useState } from "react";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import { Card, Button } from "@/components";

/**
 * BackgroundSettings Component
 *
 * Admin component for configuring site background settings.
 * Supports color, gradient, image, and video backgrounds for both light and dark modes.
 *
 * @component
 */

interface BackgroundConfig {
  type: "color" | "gradient" | "image" | "video";
  value: string;
  overlay?: {
    enabled: boolean;
    color: string;
    opacity: number;
  };
}

interface BackgroundSettingsProps {
  lightMode: BackgroundConfig;
  darkMode: BackgroundConfig;
  onChange: (mode: "light" | "dark", config: BackgroundConfig) => void;
}

export default function BackgroundSettings({
  lightMode,
  darkMode,
  onChange,
}: BackgroundSettingsProps) {
  const [activeTab, setActiveTab] = useState<"light" | "dark">("light");
  const config = activeTab === "light" ? lightMode : darkMode;

  const updateConfig = (updates: Partial<BackgroundConfig>) => {
    onChange(activeTab, { ...config, ...updates });
  };

  const updateOverlay = (
    updates: Partial<NonNullable<BackgroundConfig["overlay"]>>,
  ) => {
    onChange(activeTab, {
      ...config,
      overlay: { ...config.overlay!, ...updates },
    });
  };

  const gradientPresets = [
    {
      name: "Ocean Blue",
      value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      name: "Sunset",
      value: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    },
    {
      name: "Green Peace",
      value: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    },
    {
      name: "Purple Dream",
      value: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    },
  ];

  return (
    <Card>
      <div className="space-y-6">
        {/* Header with Tabs */}
        <div
          className={`flex items-center justify-between border-b ${THEME_CONSTANTS.themed.borderColor}`}
        >
          <h2
            className={`text-lg font-semibold ${THEME_CONSTANTS.themed.textPrimary} pb-4`}
          >
            Background Settings
          </h2>
          <div className="flex gap-2 pb-4">
            <Button
              onClick={() => setActiveTab("light")}
              variant={activeTab === "light" ? "primary" : "outline"}
              size="sm"
            >
              ☀️ Light Mode
            </Button>
            <Button
              onClick={() => setActiveTab("dark")}
              variant={activeTab === "dark" ? "primary" : "outline"}
              size="sm"
            >
              🌙 Dark Mode
            </Button>
          </div>
        </div>

        {/* Background Type Selector */}
        <div>
          <label
            className={`block text-sm font-medium mb-3 ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            Background Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["color", "gradient", "image", "video"] as const).map((type) => (
              <button
                key={type}
                onClick={() => updateConfig({ type })}
                className={`px-4 py-3 rounded-lg border-2 transition-all capitalize ${
                  config.type === type
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300"
                    : `${THEME_CONSTANTS.themed.border} ${THEME_CONSTANTS.themed.hoverBorder}`
                }`}
              >
                {type === "color" && "🎨"}
                {type === "gradient" && "🌈"}
                {type === "image" && "🖼️"}
                {type === "video" && "🎥"} {type}
              </button>
            ))}
          </div>
        </div>

        {/* Type-Specific Settings */}
        {config.type === "color" && (
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${THEME_CONSTANTS.themed.textPrimary}`}
            >
              Color
            </label>
            <div className="flex gap-3 items-center">
              <input
                type="color"
                value={config.value}
                onChange={(e) => updateConfig({ value: e.target.value })}
                className={`w-20 h-12 rounded-lg border ${THEME_CONSTANTS.themed.border} cursor-pointer`}
              />
              <input
                type="text"
                value={config.value}
                onChange={(e) => updateConfig({ value: e.target.value })}
                placeholder="#000000"
                className={`flex-1 px-3 py-2 border ${THEME_CONSTANTS.themed.border} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
              />
            </div>
          </div>
        )}

        {config.type === "gradient" && (
          <div className="space-y-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${THEME_CONSTANTS.themed.textPrimary}`}
              >
                Gradient CSS
              </label>
              <textarea
                value={config.value}
                onChange={(e) => updateConfig({ value: e.target.value })}
                placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                rows={3}
                className={`${THEME_CONSTANTS.patterns.adminInput} font-mono text-sm`}
              />
            </div>
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${THEME_CONSTANTS.themed.textPrimary}`}
              >
                Quick Presets
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {gradientPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => updateConfig({ value: preset.value })}
                    className={`relative h-20 rounded-lg border-2 ${THEME_CONSTANTS.themed.border} hover:border-blue-500 overflow-hidden transition-all group`}
                    style={{ background: preset.value }}
                  >
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {preset.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {config.type === "image" && (
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${THEME_CONSTANTS.themed.textPrimary}`}
            >
              Image URL
            </label>
            <input
              type="url"
              value={config.value}
              onChange={(e) => updateConfig({ value: e.target.value })}
              placeholder="https://example.com/background.jpg"
              className={THEME_CONSTANTS.patterns.adminInput}
            />
            {config.value && (
              <div
                className={`mt-3 rounded-lg overflow-hidden border ${THEME_CONSTANTS.themed.border}`}
              >
                <img
                  src={config.value}
                  alt="Background preview"
                  className="w-full h-40 object-cover"
                />
              </div>
            )}
          </div>
        )}

        {config.type === "video" && (
          <div>
            <label
              className={`block text-sm font-medium mb-2 ${THEME_CONSTANTS.themed.textPrimary}`}
            >
              Video URL (MP4)
            </label>
            <input
              type="url"
              value={config.value}
              onChange={(e) => updateConfig({ value: e.target.value })}
              placeholder="https://example.com/background.mp4"
              className={THEME_CONSTANTS.patterns.adminInput}
            />
            <p
              className={`mt-2 text-sm ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              Note: Video will auto-play, loop, and be muted for better UX
            </p>
          </div>
        )}

        {/* Overlay Settings */}
        <div className={`border-t ${THEME_CONSTANTS.themed.borderColor} pt-6`}>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="overlay-enabled"
              checked={config.overlay?.enabled || false}
              onChange={(e) =>
                updateOverlay({
                  enabled: e.target.checked,
                  color: config.overlay?.color || "#000000",
                  opacity: config.overlay?.opacity || 0.5,
                })
              }
              className="w-4 h-4 text-blue-600 rounded"
            />
            <label
              htmlFor="overlay-enabled"
              className={`text-sm font-medium ${THEME_CONSTANTS.themed.textPrimary}`}
            >
              Enable Overlay (improves content readability)
            </label>
          </div>

          {config.overlay?.enabled && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ml-7">
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${THEME_CONSTANTS.themed.textSecondary}`}
                >
                  Overlay Color
                </label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={config.overlay.color}
                    onChange={(e) => updateOverlay({ color: e.target.value })}
                    className={`w-12 h-10 rounded border ${THEME_CONSTANTS.themed.border}`}
                  />
                  <input
                    type="text"
                    value={config.overlay.color}
                    onChange={(e) => updateOverlay({ color: e.target.value })}
                    className={`flex-1 px-3 py-2 border ${THEME_CONSTANTS.themed.border} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm`}
                  />
                </div>
              </div>
              <div>
                <label
                  className={`block text-sm font-medium mb-2 ${THEME_CONSTANTS.themed.textSecondary}`}
                >
                  Opacity ({Math.round(config.overlay.opacity * 100)}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={config.overlay.opacity}
                  onChange={(e) =>
                    updateOverlay({ opacity: parseFloat(e.target.value) })
                  }
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        {/* Preview */}
        <div className={`border-t ${THEME_CONSTANTS.themed.borderColor} pt-6`}>
          <label
            className={`block text-sm font-medium mb-3 ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            Preview
          </label>
          <div
            className={`relative h-40 rounded-lg overflow-hidden border-2 ${THEME_CONSTANTS.themed.border}`}
            style={{
              background:
                config.type === "color" || config.type === "gradient"
                  ? config.value
                  : undefined,
              backgroundImage:
                config.type === "image" ? `url('${config.value}')` : undefined,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {config.type === "video" && config.value && (
              <video
                src={config.value}
                autoPlay
                loop
                muted
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {config.overlay?.enabled && (
              <div
                className="absolute inset-0"
                style={{
                  backgroundColor: config.overlay.color,
                  opacity: config.overlay.opacity,
                }}
              />
            )}
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-white text-lg font-semibold drop-shadow-lg">
                Sample Content
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
