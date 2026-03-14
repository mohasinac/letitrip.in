"use client";

import { useState } from "react";
import Image from "next/image";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import {
  Button,
  Card,
  Checkbox,
  FormGroup,
  Heading,
  Input,
  Label,
  Slider,
  Span,
  Text,
  Textarea,
} from "@/components";

const { flex, position } = THEME_CONSTANTS;

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
          className={`${flex.between} border-b ${THEME_CONSTANTS.themed.borderColor}`}
        >
          <Heading level={2} className="pb-4">
            Background Settings
          </Heading>
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
          <Label
            className={`block text-sm font-medium mb-3 ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            Background Type
          </Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(["color", "gradient", "image", "video"] as const).map((type) => (
              <Button
                key={type}
                variant="ghost"
                onClick={() => updateConfig({ type })}
                className={`px-4 py-3 rounded-lg border-2 transition-all capitalize ${
                  config.type === type
                    ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary"
                    : `${THEME_CONSTANTS.themed.border} ${THEME_CONSTANTS.themed.hoverBorder}`
                }`}
              >
                {type === "color" && "🎨"}
                {type === "gradient" && "🌈"}
                {type === "image" && "🖼️"}
                {type === "video" && "🎥"} {type}
              </Button>
            ))}
          </div>
        </div>

        {/* Type-Specific Settings */}
        {config.type === "color" && (
          <div>
            <Label
              className={`block text-sm font-medium mb-2 ${THEME_CONSTANTS.themed.textPrimary}`}
            >
              Color
            </Label>
            <div className="flex gap-3 items-center">
              <Input
                type="color"
                value={config.value}
                onChange={(e) => updateConfig({ value: e.target.value })}
                className="w-20 h-12 rounded-lg cursor-pointer"
              />
              <Input
                type="text"
                value={config.value}
                onChange={(e) => updateConfig({ value: e.target.value })}
                placeholder="#000000"
                className="flex-1"
              />
            </div>
          </div>
        )}

        {config.type === "gradient" && (
          <div className={THEME_CONSTANTS.spacing.stack}>
            <div>
              <Label
                className={`block text-sm font-medium mb-2 ${THEME_CONSTANTS.themed.textPrimary}`}
              >
                Gradient CSS
              </Label>
              <Textarea
                value={config.value}
                onChange={(e) => updateConfig({ value: e.target.value })}
                placeholder="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                rows={3}
                className={`${THEME_CONSTANTS.patterns.adminInput} font-mono text-sm`}
              />
            </div>
            <div>
              <Label
                className={`block text-sm font-medium mb-2 ${THEME_CONSTANTS.themed.textPrimary}`}
              >
                Quick Presets
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {gradientPresets.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="ghost"
                    onClick={() => updateConfig({ value: preset.value })}
                    className={`relative h-20 rounded-lg border-2 ${THEME_CONSTANTS.themed.border} hover:border-primary overflow-hidden transition-all group`}
                    style={{ background: preset.value }}
                  >
                    <div
                      className={`${position.fill} bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity ${flex.center}`}
                    >
                      <Span className="text-white text-sm font-medium">
                        {preset.name}
                      </Span>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}

        {config.type === "image" && (
          <div>
            <Label
              className={`block text-sm font-medium mb-2 ${THEME_CONSTANTS.themed.textPrimary}`}
            >
              Image URL
            </Label>
            <Input
              type="url"
              value={config.value}
              onChange={(e) => updateConfig({ value: e.target.value })}
              placeholder="https://example.com/background.jpg"
            />
            {config.value && (
              <div
                className={`mt-3 rounded-lg overflow-hidden border relative h-40 ${THEME_CONSTANTS.themed.border}`}
              >
                <Image
                  src={config.value}
                  alt="Background preview"
                  fill
                  className="object-cover"
                  sizes="100vw"
                  unoptimized
                />
              </div>
            )}
          </div>
        )}

        {config.type === "video" && (
          <div>
            <Label
              className={`block text-sm font-medium mb-2 ${THEME_CONSTANTS.themed.textPrimary}`}
            >
              Video URL (MP4)
            </Label>
            <Input
              type="url"
              value={config.value}
              onChange={(e) => updateConfig({ value: e.target.value })}
              placeholder="https://example.com/background.mp4"
            />
            <Text
              className={`mt-2 text-sm ${THEME_CONSTANTS.themed.textSecondary}`}
            >
              Note: Video will auto-play, loop, and be muted for better UX
            </Text>
          </div>
        )}

        {/* Overlay Settings */}
        <div className={`border-t ${THEME_CONSTANTS.themed.borderColor} pt-6`}>
          <div className="flex items-center gap-3 mb-4">
            <Checkbox
              id="overlay-enabled"
              checked={config.overlay?.enabled || false}
              onChange={(e) =>
                updateOverlay({
                  enabled: e.target.checked,
                  color: config.overlay?.color || "#000000",
                  opacity: config.overlay?.opacity || 0.5,
                })
              }
              label="Enable Overlay (improves content readability)"
            />
          </div>

          {config.overlay?.enabled && (
            <FormGroup columns={2} className="ml-7">
              <div>
                <Label
                  className={`block text-sm font-medium mb-2 ${THEME_CONSTANTS.themed.textSecondary}`}
                >
                  Overlay Color
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    value={config.overlay.color}
                    onChange={(e) => updateOverlay({ color: e.target.value })}
                    className="w-12 h-10 rounded cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={config.overlay.color}
                    onChange={(e) => updateOverlay({ color: e.target.value })}
                    className="flex-1 text-sm"
                  />
                </div>
              </div>
              <div>
                <Label
                  className={`block text-sm font-medium mb-2 ${THEME_CONSTANTS.themed.textSecondary}`}
                >
                  Opacity ({Math.round(config.overlay.opacity * 100)}%)
                </Label>
                <Slider
                  min={0}
                  max={1}
                  step={0.05}
                  value={config.overlay.opacity}
                  onChange={(value) => updateOverlay({ opacity: value })}
                  className="w-full"
                />
              </div>
            </FormGroup>
          )}
        </div>

        {/* Preview */}
        <div className={`border-t ${THEME_CONSTANTS.themed.borderColor} pt-6`}>
          <Label
            className={`block text-sm font-medium mb-3 ${THEME_CONSTANTS.themed.textPrimary}`}
          >
            Preview
          </Label>
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
                className={`${position.fill} w-full h-full object-cover`}
              />
            )}
            {config.overlay?.enabled && (
              <div
                className={position.fill}
                style={{
                  backgroundColor: config.overlay.color,
                  opacity: config.overlay.opacity,
                }}
              />
            )}
            <div className={`${position.fill} ${flex.center}`}>
              <Text
                variant="none"
                className="text-white text-lg font-semibold drop-shadow-lg"
              >
                Sample Content
              </Text>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
