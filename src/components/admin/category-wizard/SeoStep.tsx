/**
 * @fileoverview React Component
 * @module src/components/admin/category-wizard/SeoStep
 * @description This file contains the SeoStep component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormLabel } from "@/components/forms/FormLabel";
import SlugInput from "@/components/common/SlugInput";
import type { CategoryFormData, OnChange } from "./types";

/**
 * SeoStepProps interface
 * 
 * @interface
 * @description Defines the structure and contract for SeoStepProps
 */
interface SeoStepProps {
  /** Form Data */
  formData: CategoryFormData;
  /** Slug Error */
  slugError?: string;
  /** On Change */
  onChange: OnChange;
  /** Validate Slug */
  validateSlug: (slug: string) => void;
}

export default /**
 * Performs seo step operation
 *
 * @param {SeoStepProps} {
  formData,
  slugError,
  onChange,
  validateSlug,
} - The {
  formdata,
  slugerror,
  onchange,
  validateslug,
}
 *
 * @returns {any} The seostep result
 *
 */
function SeoStep({
  formData,
  slugError,
  onChange,
  validateSlug,
}: SeoStepProps) {
  return (
    <div className="space-y-6">
      <div>
        <FormLabel required>URL Slug</FormLabel>
        <SlugInput
          sourceText={formData.name}
          value={formData.slug}
          onChange={(slug: string) => {
            onChange("slug", slug);
            validateSlug(slug);
          }}
          prefix="categories/"
          error={slugError}
        />
      </div>

      <FormInput
        label="Meta Title"
        value={formData.metaTitle}
        onChange={(e) => onChange("metaTitle", e.target.value)}
        maxLength={60}
        placeholder={`${formData.name || "Category"} - Shop on Letitrip`}
        helperText={`${formData.metaTitle.length}/60 characters • Leave empty to use category name`}
      />

      <FormTextarea
        label="Meta Description"
        value={formData.metaDescription}
        onChange={(e) => onChange("metaDescription", e.target.value)}
        maxLength={160}
        rows={3}
        placeholder="Browse our collection of quality products in this category..."
        helperText={`${formData.metaDescription.length}/160 characters • Appears in search results`}
      />

      <div className="rounded-lg bg-green-50 border border-green-200 p-4">
        <p className="text-sm font-medium text-green-900 mb-2">
          Search Engine Preview
        </p>
        <div className="text-sm">
          <p className="text-blue-600 font-medium truncate">
            {formData.metaTitle || formData.name || "Category Name"} - Letitrip
          </p>
          <p className="text-green-700 text-xs truncate">
            letitrip.in/categories/{formData.slug || "category-slug"}
          </p>
          <p className="text-gray-600 mt-1 line-clamp-2">
            {formData.metaDescription ||
              formData.description ||
              "Category description will appear here..."}
          </p>
        </div>
      </div>
    </div>
  );
}
