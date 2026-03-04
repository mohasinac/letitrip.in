/**
 * CarouselSlideForm Component
 * Path: src/components/admin/carousel/CarouselSlideForm.tsx
 *
 * Form for creating/editing carousel slides inside SideDrawer.
 * Uses FormField, ImageUpload, GridEditor from @/components.
 */

"use client";

import Image from "next/image";
import {
  Checkbox,
  FormField,
  GridEditor,
  Heading,
  ImageUpload,
  Label,
  Span,
} from "@/components";
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
          <Label className={`block ${typography.label} mb-2`}>
            Slide Image
          </Label>
          <div className="relative h-32 w-40 overflow-hidden rounded">
            <Image
              src={slide.imageUrl}
              alt={slide.title}
              fill
              className="object-cover"
              sizes="160px"
              unoptimized
            />
          </div>
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
          <Checkbox
            checked={slide.isActive}
            onChange={(e) => update({ isActive: e.target.checked })}
            disabled={isReadonly}
            label={UI_LABELS.STATUS.ACTIVE}
          />
        </div>
      </div>

      {!isReadonly && (
        <div className={`border-t ${themed.border} pt-4`}>
          <Heading level={3} className="mb-4">
            Grid Layout Designer (Optional)
          </Heading>
          <GridEditor
            initialGrid={slide.gridData}
            onChange={(grid) => update({ gridData: grid })}
          />
        </div>
      )}
    </div>
  );
}
