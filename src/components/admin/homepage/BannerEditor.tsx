/**
 * @fileoverview React Component
 * @module src/components/admin/homepage/BannerEditor
 * @description This file contains the BannerEditor component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { ToggleSwitch } from "@/components/admin/ToggleSwitch";
import RichTextEditor from "@/components/common/RichTextEditor";
import { FormInput } from "@/components/forms/FormInput";
import { FormLabel } from "@/components/forms/FormLabel";

/**
 * BannerSettings interface
 * 
 * @interface
 * @description Defines the structure and contract for BannerSettings
 */
interface BannerSettings {
  /** Enabled */
  enabled: boolean;
  /** Title */
  title: string;
  /** Content */
  content: string;
  /** Link */
  link?: string;
  /** Background Color */
  backgroundColor?: string;
  /** Text Color */
  textColor?: string;
}

/**
 * BannerEditorProps interface
 * 
 * @interface
 * @description Defines the structure and contract for BannerEditorProps
 */
interface BannerEditorProps {
  /** Settings */
  settings: BannerSettings;
  /** On Change */
  onChange: (settings: BannerSettings) => void;
}

/**
 * Function: Banner Editor
 */
/**
 * Performs banner editor operation
 *
 * @param {BannerEditorProps} { settings, onChange } - The { settings, on change }
 *
 * @returns {any} The bannereditor result
 *
 * @example
 * BannerEditor({ settings, onChange });
 */

/**
 * Performs banner editor operation
 *
 * @param {BannerEditorProps} { settings, onChange } - The { settings, on change }
 *
 * @returns {any} The bannereditor result
 *
 * @example
 * BannerEditor({ settings, onChange });
 */

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
              /** Enabled */
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
                  /** Content */
                  content: value,
                })
              }
              placeholder="Enter banner content..."
              minHeight={150}
            />
          </div>

          <FormInput
            label="Link URL (Optional)"
            value={settings.link || ""}
            onChange={(e) =>
              onChange({
                ...settings,
                /** Link */
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
                      /** Background Color */
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
                      /** Background Color */
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
                      /** Text Color */
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
                      /** Text Color */
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
