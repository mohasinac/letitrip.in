/**
 * SectionForm Component
 * Path: src/components/admin/sections/SectionForm.tsx
 *
 * Drawer form for creating/editing homepage sections.
 * Includes RichTextEditor for description and JSON config editor.
 */

"use client";

import { FormField, RichTextEditor } from "@/components";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import type { HomepageSection } from "./types";
import { SECTION_TYPES } from "./types";

const { spacing, themed, typography } = THEME_CONSTANTS;
const LABELS = UI_LABELS.ADMIN.SECTIONS;

interface SectionFormProps {
  section: HomepageSection;
  onChange: (updated: HomepageSection) => void;
  isReadonly?: boolean;
  isCreate?: boolean;
}

export function SectionForm({
  section,
  onChange,
  isReadonly = false,
  isCreate = false,
}: SectionFormProps) {
  const update = (partial: Partial<HomepageSection>) => {
    onChange({ ...section, ...partial });
  };

  return (
    <div className={spacing.stack}>
      <FormField
        name="type"
        label={LABELS.SECTION_TYPE}
        type="select"
        value={section.type}
        onChange={(value) => update({ type: value })}
        disabled={!isCreate}
        options={SECTION_TYPES.map((t) => ({
          value: t.value,
          label: t.label,
        }))}
      />

      <FormField
        name="title"
        label="Title"
        type="text"
        value={section.title}
        onChange={(value) => update({ title: value })}
        disabled={isReadonly}
      />

      <div>
        <label className={`block ${typography.label} mb-2`}>Description</label>
        {isReadonly ? (
          <div
            className={`${THEME_CONSTANTS.patterns.adminInput} opacity-60 min-h-[100px]`}
            dangerouslySetInnerHTML={{ __html: section.description || "" }}
          />
        ) : (
          <RichTextEditor
            content={section.description || ""}
            onChange={(content) => update({ description: content })}
            placeholder="Enter section description..."
            minHeight="150px"
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          name="order"
          label="Order"
          type="number"
          value={String(section.order)}
          onChange={(value) => update({ order: parseInt(value) || 0 })}
          disabled={isReadonly}
        />

        <div className="flex items-end">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={section.enabled}
              onChange={(e) => update({ enabled: e.target.checked })}
              disabled={isReadonly}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <span className={typography.label}>
              {UI_LABELS.ADMIN.CATEGORIES.ENABLED}
            </span>
          </label>
        </div>
      </div>

      <div>
        <label className={`block ${typography.label} mb-2`}>
          {LABELS.CONFIGURATION}
        </label>
        <textarea
          value={JSON.stringify(section.config, null, 2)}
          onChange={(e) => {
            try {
              const config = JSON.parse(e.target.value);
              update({ config });
            } catch {
              // Invalid JSON, ignore
            }
          }}
          readOnly={isReadonly}
          rows={10}
          className={`${THEME_CONSTANTS.patterns.adminInput} font-mono text-sm ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
        />
      </div>
    </div>
  );
}
