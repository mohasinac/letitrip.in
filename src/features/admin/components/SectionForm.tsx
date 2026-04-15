/**
 * SectionForm Component
 * Path: src/features/admin/components/SectionForm.tsx
 *
 * Drawer form for creating/editing homepage sections.
 * Renders structured config fields for carousel-type sections;
 * falls back to a JSON textarea for all other section types.
 */

"use client";

import { FormGroup } from "@mohasinac/appkit/ui";
import { Textarea } from "@mohasinac/appkit/ui";
import { Label } from "@mohasinac/appkit/ui";
import { Checkbox } from "@mohasinac/appkit/ui";
import { FormField } from "@/components";
import { RichTextEditor } from "./RichTextEditor";
import { THEME_CONSTANTS } from "@/constants";
import { proseMirrorToHtml } from "@/utils";
import { useTranslations } from "next-intl";
import type { HomepageSection } from "./Section.types";
import { SECTION_TYPES } from "./Section.types";

const { spacing, typography } = THEME_CONSTANTS;

// Section types whose config is rendered with structured fields
const CAROUSEL_SECTION_TYPES = [
  "categories",
  "products",
  "auctions",
  "stores",
  "events",
  "reviews",
] as const;

type CarouselSectionType = (typeof CAROUSEL_SECTION_TYPES)[number];

function isCarouselType(type: string): type is CarouselSectionType {
  return (CAROUSEL_SECTION_TYPES as readonly string[]).includes(type);
}

/** Returns the config key that stores the max-items count for a given type. */
function getMaxItemsKey(type: CarouselSectionType): string | null {
  const map: Partial<Record<CarouselSectionType, string>> = {
    products: "maxProducts",
    auctions: "maxAuctions",
    stores: "maxStores",
    events: "maxEvents",
    reviews: "maxReviews",
  };
  return map[type] ?? null;
}

/**
 * Structured config editor for carousel-type sections.
 * Fields are derived from the section's config interface in the schema.
 */
function CarouselConfigFields({
  type,
  config,
  onConfigChange,
  isReadonly,
}: {
  type: CarouselSectionType;
  config: Record<string, any>;
  onConfigChange: (updated: Record<string, any>) => void;
  isReadonly: boolean;
}) {
  const t = useTranslations("adminSections");

  const patch = (partial: Record<string, any>) =>
    onConfigChange({ ...config, ...partial });

  const maxKey = getMaxItemsKey(type);
  const hasSubtitle = (
    ["products", "auctions", "stores", "events"] as string[]
  ).includes(type);
  const hasItemsPerView = type === "reviews";

  return (
    <div className={spacing.stack}>
      {/* Subtitle — products, auctions, stores, events */}
      {hasSubtitle && (
        <FormField
          name="configSubtitle"
          label={t("formSubtitle")}
          type="text"
          value={(config.subtitle as string) ?? ""}
          onChange={(val) => patch({ subtitle: val })}
          disabled={isReadonly}
        />
      )}

      {/* Max items */}
      {maxKey && (
        <FormField
          name="configMaxItems"
          label={t("formMaxItems")}
          type="number"
          value={String((config[maxKey] as number) ?? 12)}
          onChange={(val) => patch({ [maxKey]: parseInt(val) || 12 })}
          disabled={isReadonly}
        />
      )}

      {/* Items per view — reviews only */}
      {hasItemsPerView && (
        <FormGroup columns={2}>
          <FormField
            name="itemsPerView"
            label={t("formItemsPerView")}
            type="number"
            value={String((config.itemsPerView as number) ?? 3)}
            onChange={(val) => patch({ itemsPerView: parseInt(val) || 3 })}
            disabled={isReadonly}
          />
          <FormField
            name="mobileItemsPerView"
            label={t("formMobileItemsPerView")}
            type="number"
            value={String((config.mobileItemsPerView as number) ?? 1)}
            onChange={(val) =>
              patch({ mobileItemsPerView: parseInt(val) || 1 })
            }
            disabled={isReadonly}
          />
        </FormGroup>
      )}

      {/* Auto scroll + interval */}
      <FormGroup columns={2}>
        <div className="flex items-end pb-1">
          <Checkbox
            label={t("formAutoScroll")}
            checked={!!config.autoScroll}
            onChange={(e) => patch({ autoScroll: e.target.checked })}
            disabled={isReadonly}
          />
        </div>
        {config.autoScroll && (
          <FormField
            name="scrollInterval"
            label={t("formScrollInterval")}
            type="number"
            value={String((config.scrollInterval as number) ?? 4000)}
            onChange={(val) => patch({ scrollInterval: parseInt(val) || 4000 })}
            disabled={isReadonly}
          />
        )}
      </FormGroup>
    </div>
  );
}

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
            dangerouslySetInnerHTML={{
              __html: proseMirrorToHtml(section.description || ""),
            }}
          />
        ) : (
          <RichTextEditor
            content={section.description || ""}
            onChange={(content) => update({ description: content })}
            placeholder={t("descriptionPlaceholder")}
            minHeight="150px"
            imageUploadConfig={{
              folder: "sections",
              context: {
                type: "rich-text-image",
                entity: "homepage-section-description",
                name: section.title || section.type || "section",
              },
            }}
          />
        )}
      </div>

      <FormGroup columns={2}>
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
      </FormGroup>

      <div>
        <Label className={`block ${typography.label} mb-2`}>
          {isCarouselType(section.type)
            ? t("carouselSettings")
            : t("configuration")}
        </Label>
        {isCarouselType(section.type) ? (
          <CarouselConfigFields
            type={section.type}
            config={section.config ?? {}}
            onConfigChange={(config) => update({ config })}
            isReadonly={isReadonly}
          />
        ) : (
          <Textarea
            value={JSON.stringify(section.config, null, 2)}
            onChange={(e) => {
              try {
                const config = JSON.parse(e.target.value);
                update({ config });
              } catch {
                // Invalid JSON — ignore intermediate states
              }
            }}
            readOnly={isReadonly}
            rows={10}
            className={`${THEME_CONSTANTS.patterns.adminInput} font-mono text-sm ${isReadonly ? "opacity-60 cursor-not-allowed" : ""}`}
          />
        )}
      </div>
    </div>
  );
}

