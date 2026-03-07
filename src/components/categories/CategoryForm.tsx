/**
 * CategoryForm Component
 * Path: src/components/admin/categories/CategoryForm.tsx
 *
 * Drawer form for creating/editing categories in admin panel.
 * Uses FormField, ImageUpload from @/components and UI_LABELS from @/constants.
 */

"use client";

import { useTranslations } from "next-intl";
import {
  Checkbox,
  FormField,
  ImageUpload,
  Label,
  MediaImage,
  Span,
} from "@/components";
import { useMediaUpload } from "@/hooks";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import type { Category } from "./Category.types";
import { flattenCategories } from "./Category.types";

const { spacing, typography } = THEME_CONSTANTS;
const LABELS = UI_LABELS.ADMIN.CATEGORIES;

interface CategoryFormProps {
  category: Partial<Category>;
  allCategories: Category[];
  onChange: (updated: Partial<Category>) => void;
  isReadonly?: boolean;
}

export function CategoryForm({
  category,
  allCategories,
  onChange,
  isReadonly = false,
}: CategoryFormProps) {
  const { upload } = useMediaUpload();
  const t = useTranslations("adminCategories");
  const update = (partial: Partial<Category>) => {
    onChange({ ...category, ...partial });
  };

  const handleNameChange = (value: string) => {
    const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    update({ name: value, slug });
  };

  return (
    <div className={spacing.stack}>
      <FormField
        name="name"
        label={UI_LABELS.TABLE.NAME}
        type="text"
        value={category.name || ""}
        onChange={handleNameChange}
        disabled={isReadonly}
      />

      <FormField
        name="slug"
        label={t("slug")}
        type="text"
        value={category.slug || ""}
        onChange={(value) => update({ slug: value })}
        disabled={isReadonly}
      />

      <FormField
        name="description"
        label={t("description")}
        type="textarea"
        rows={3}
        value={category.description || ""}
        onChange={(value) => update({ description: value })}
        disabled={isReadonly}
      />

      {!isReadonly && (
        <ImageUpload
          currentImage={category.display?.coverImage}
          onUpload={(file) => upload(file, "categories")}
          onChange={(url) =>
            update({ display: { ...category.display, coverImage: url } })
          }
          label={t("categoryImage")}
          helperText={t("imageRecommended")}
        />
      )}

      {category.display?.coverImage && isReadonly && (
        <div>
          <Label className={`block ${typography.label} mb-2`}>
            {t("categoryImage")}
          </Label>
          <div className="relative h-32 w-40 overflow-hidden rounded">
            <MediaImage
              src={category.display.coverImage}
              alt={category.name || ""}
              size="card"
            />
          </div>
        </div>
      )}

      <FormField
        name="parentId"
        label={LABELS.PARENT_CATEGORY}
        type="select"
        value={category.parentId || ""}
        onChange={(value) => update({ parentId: value || null })}
        disabled={isReadonly}
        options={[
          { value: "", label: LABELS.NONE_ROOT },
          ...flattenCategories(allCategories).map((cat) => ({
            value: cat.id,
            label: `${"  ".repeat(cat.tier)}${cat.name}`,
            disabled: cat.id === category.id,
          })),
        ]}
      />

      <div className="grid grid-cols-2 gap-4">
        <Checkbox
          checked={category.enabled || false}
          onChange={(e) => update({ enabled: e.target.checked })}
          disabled={isReadonly}
          label={LABELS.ENABLED}
        />

        <Checkbox
          checked={category.showOnHomepage || false}
          onChange={(e) => update({ showOnHomepage: e.target.checked })}
          disabled={isReadonly}
          label={LABELS.SHOW_ON_HOMEPAGE}
        />

        <Checkbox
          checked={category.isBrand || false}
          onChange={(e) => update({ isBrand: e.target.checked })}
          disabled={isReadonly}
          label={LABELS.IS_BRAND}
        />
      </div>

      <FormField
        name="order"
        label="Order"
        type="number"
        value={String(category.order || 0)}
        onChange={(value) => update({ order: parseInt(value) || 0 })}
        disabled={isReadonly}
      />
    </div>
  );
}
