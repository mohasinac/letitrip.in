"use client";

import { ToggleSwitch } from "@/components/admin/ToggleSwitch";
import { FormInput, FormLabel, RichTextEditor } from "@letitrip/react-library";

interface BannerSettings {
  enabled: boolean;
  title: string;
  content: string;
  link?: string;
  backgroundColor?: string;
  textColor?: string;
}

interface BannerEditorProps {
  settings: BannerSettings;
  onChange: (settings: BannerSettings) => void;
}

export function BannerEditor({ settings, onChange }: BannerEditorProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Special Event Banner
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Announcement banner at the very top of the site
          </p>
        </div>
        <ToggleSwitch
          enabled={settings.enabled}
          onToggle={() =>
            onChange({
              ...settings,
              enabled: !settings.enabled,
            })
          }
        />
      </div>

      {settings.enabled && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <FormLabel htmlFor="banner-content">
              Banner Content (Rich Text)
            </FormLabel>
            <RichTextEditor
              value={settings.content}
              onChange={(value: string) =>
                onChange({
                  ...settings,
                  content: value,
                })
              }
              placeholder="Enter banner content..."
              minHeight="150px"
            />
          </div>

          <FormInput
            label="Link URL (Optional)"
            value={settings.link || ""}
            onChange={(e) =>
              onChange({
                ...settings,
                link: e.target.value,
              })
            }
            placeholder="/special-offers"
          />

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FormLabel htmlFor="banner-bg-color">Background Color</FormLabel>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.backgroundColor || "#2563eb"}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      backgroundColor: e.target.value,
                    })
                  }
                  className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.backgroundColor || "#2563eb"}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      backgroundColor: e.target.value,
                    })
                  }
                  placeholder="#2563eb"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <FormLabel htmlFor="banner-text-color">Text Color</FormLabel>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={settings.textColor || "#ffffff"}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      textColor: e.target.value,
                    })
                  }
                  className="h-10 w-20 rounded border border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.textColor || "#ffffff"}
                  onChange={(e) =>
                    onChange({
                      ...settings,
                      textColor: e.target.value,
                    })
                  }
                  placeholder="#ffffff"
                  className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-gray-100"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
