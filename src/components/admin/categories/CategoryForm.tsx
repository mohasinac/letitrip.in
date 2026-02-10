/**
 * CategoryForm Component
 * Path: src/components/admin/categories/CategoryForm.tsx
 *
 * Drawer form for creating/editing categories in admin panel.
 * Uses FormField, ImageUpload from @/components and UI_LABELS from @/constants.
 */

"use client";

import { FormField, ImageUpload } from "@/components";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import type { Category } from "./types";
import { flattenCategories } from "./types";

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
        label="Slug"
        type="text"
        value={category.slug || ""}
        onChange={(value) => update({ slug: value })}
        disabled={isReadonly}
      />

      <FormField
        name="description"
        label="Description"
        type="textarea"
        rows={3}
        value={category.description || ""}
        onChange={(value) => update({ description: value })}
        disabled={isReadonly}
      />

      {!isReadonly && (
        <ImageUpload
          currentImage={category.imageUrl}
          onUpload={(url) => update({ imageUrl: url })}
          folder="categories"
          label="Category Image"
          helperText="Recommended: 400x300px"
        />
      )}

      {category.imageUrl && isReadonly && (
        <div>
          <label className={`block ${typography.label} mb-2`}>
            Category Image
          </label>
          <img
            src={category.imageUrl}
            alt={category.name || "Category"}
            className="h-32 w-auto object-cover rounded"
          />
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
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={category.enabled || false}
            onChange={(e) => update({ enabled: e.target.checked })}
            disabled={isReadonly}
            className="w-4 h-4 text-indigo-600 rounded"
          />
          <span className={typography.label}>{LABELS.ENABLED}</span>
        </label>

        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={category.showOnHomepage || false}
            onChange={(e) => update({ showOnHomepage: e.target.checked })}
            disabled={isReadonly}
            className="w-4 h-4 text-indigo-600 rounded"
          />
          <span className={typography.label}>{LABELS.SHOW_ON_HOMEPAGE}</span>
        </label>
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
