/**
 * CarouselSlideForm Component
 * Path: src/components/admin/carousel/CarouselSlideForm.tsx
 *
 * Form for creating/editing carousel slides inside SideDrawer.
 * Uses FormField, ImageUpload, GridEditor from @/components.
 */

"use client";

import { FormField, ImageUpload, GridEditor } from "@/components";
import { THEME_CONSTANTS, UI_LABELS } from "@/constants";
import type { CarouselSlide } from "./types";

const { spacing, themed, typography } = THEME_CONSTANTS;

interface CarouselSlideFormProps {
  slide: CarouselSlide;
  onChange: (updated: CarouselSlide) => void;
  isReadonly?: boolean;
}

export function CarouselSlideForm({
  slide,
  onChange,
  isReadonly = false,
}: CarouselSlideFormProps) {
  const update = (partial: Partial<CarouselSlide>) => {
    onChange({ ...slide, ...partial });
  };

  return (
    <div className={spacing.stack}>
      <FormField
        name="title"
        label="Title"
        type="text"
        value={slide.title}
        onChange={(value) => update({ title: value })}
        disabled={isReadonly}
      />

      <FormField
        name="description"
        label="Description"
        type="textarea"
        rows={3}
        value={slide.description || ""}
        onChange={(value) => update({ description: value })}
        disabled={isReadonly}
      />

      {!isReadonly && (
        <ImageUpload
          currentImage={slide.imageUrl}
          onUpload={(url) => update({ imageUrl: url })}
          folder="carousel"
          label="Slide Image"
          helperText="Recommended: 1920x600px"
        />
      )}

      {slide.imageUrl && isReadonly && (
        <div>
          <label className={`block ${typography.label} mb-2`}>
            Slide Image
          </label>
          <img
            src={slide.imageUrl}
            alt={slide.title}
            className="h-32 w-auto object-cover rounded"
          />
        </div>
      )}

      <FormField
        name="linkUrl"
        label="Link URL (optional)"
        type="text"
        value={slide.linkUrl || ""}
        onChange={(value) => update({ linkUrl: value })}
        disabled={isReadonly}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          name="order"
          label="Order"
          type="number"
          value={String(slide.order)}
          onChange={(value) => update({ order: parseInt(value) || 0 })}
          disabled={isReadonly}
        />

        <div className="flex items-end">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={slide.isActive}
              onChange={(e) => update({ isActive: e.target.checked })}
              disabled={isReadonly}
              className="w-4 h-4 text-indigo-600 rounded"
            />
            <span className={typography.label}>{UI_LABELS.STATUS.ACTIVE}</span>
          </label>
        </div>
      </div>

      {!isReadonly && (
        <div className={`border-t ${themed.border} pt-4`}>
          <h3 className={`${typography.cardTitle} mb-4`}>
            Grid Layout Designer (Optional)
          </h3>
          <GridEditor
            initialGrid={slide.gridData}
            onChange={(grid) => update({ gridData: grid })}
          />
        </div>
      )}
    </div>
  );
}
