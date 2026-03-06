/**
 * SectionForm Component
 * Path: src/components/admin/sections/SectionForm.tsx
 *
 * Drawer form for creating/editing homepage sections.
 * Includes RichTextEditor for description and JSON config editor.
 */

"use client";

import {
  Checkbox,
  FormField,
  Label,
  RichTextEditor,
  Textarea,
} from "@/components";
import { THEME_CONSTANTS } from "@/constants";
import { useTranslations } from "next-intl";
import type { HomepageSection } from "./Section.types";
import { SECTION_TYPES } from "./Section.types";

const { spacing, typography } = THEME_CONSTANTS;

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
  const t = useTranslations("adminSections");

  const update = (partial: Partial<HomepageSection>) => {
    onChange({ ...section, ...partial });
  };

  return (
    <div className={spacing.stack}>
      <FormField
        name="type"
        label={t("sectionType")}
        type="select"
        value={section.type}
        onChange={(value) => update({ type: value })}
        disabled={!isCreate}
        options={SECTION_TYPES.map((st) => ({
          value: st.value,
          label: st.label,
        }))}
      />

      <FormField
        name="title"
        label={t("formTitle")}
        type="text"
        value={section.title}
        onChange={(value) => update({ title: value })}
        disabled={isReadonly}
      />

      <div>
        <Label className={`block ${typography.label} mb-2`}>
          {t("formDescription")}
        </Label>
        {isReadonly ? (
          <div
            className={`${THEME_CONSTANTS.patterns.adminInput} opacity-60 min-h-[100px]`}
            dangerouslySetInnerHTML={{ __html: section.description || "" }}
          />
        ) : (
          <RichTextEditor
            content={section.description || ""}
            onChange={(content) => update({ description: content })}
            placeholder={t("descriptionPlaceholder")}
            minHeight="150px"
          />
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          name="order"
          label={t("formOrder")}
          type="number"
          value={String(section.order)}
          onChange={(value) => update({ order: parseInt(value) || 0 })}
          disabled={isReadonly}
        />

        <div className="flex items-end">
          <Checkbox
            label={t("enabled")}
            checked={section.enabled}
            onChange={(e) => update({ enabled: e.target.checked })}
            disabled={isReadonly}
          />
        </div>
      </div>

      <div>
        <Label className={`block ${typography.label} mb-2`}>
          {t("configuration")}
        </Label>
        <Textarea
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
