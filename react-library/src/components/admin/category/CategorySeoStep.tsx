import React from "react";

export interface CategorySeoStepData {
  name: string;
  slug: string;
  metaTitle: string;
  metaDescription: string;
  description: string;
}

export interface CategorySeoStepProps {
  formData: CategorySeoStepData;
  slugError?: string;
  onChange: (field: keyof CategorySeoStepData, value: string) => void;
  validateSlug: (slug: string) => void;
  errors?: Record<string, string>;
  // Component injection for framework independence
  FormInputComponent?: React.ComponentType<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    maxLength?: number;
    placeholder?: string;
    error?: string;
    helperText?: string;
  }>;
  FormTextareaComponent?: React.ComponentType<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    maxLength?: number;
    rows?: number;
    placeholder?: string;
    error?: string;
    helperText?: string;
  }>;
  FormLabelComponent?: React.ComponentType<{
    required?: boolean;
    children: React.ReactNode;
  }>;
  SlugInputComponent?: React.ComponentType<{
    sourceText: string;
    value: string;
    onChange: (slug: string) => void;
    prefix?: string;
    error?: string;
  }>;
  // Configuration
  baseUrl?: string;
  siteName?: string;
}

/**
 * Category SEO Step - Framework Independent
 *
 * Form step for configuring category SEO settings including
 * slug, meta title, meta description, and search engine preview.
 */
export function CategorySeoStep({
  formData,
  slugError,
  onChange,
  validateSlug,
  errors,
  FormInputComponent,
  FormTextareaComponent,
  FormLabelComponent,
  SlugInputComponent,
  baseUrl = "letitrip.in",
  siteName = "Letitrip",
}: CategorySeoStepProps) {
  // Fallback components if injections are missing
  if (
    !FormInputComponent ||
    !FormTextareaComponent ||
    !FormLabelComponent ||
    !SlugInputComponent
  ) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="text-red-600 text-sm">
          Missing form component injections. Please provide FormInputComponent,
          FormTextareaComponent, FormLabelComponent, and SlugInputComponent.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* URL Slug */}
      <div>
        <FormLabelComponent required>URL Slug</FormLabelComponent>
        <SlugInputComponent
          sourceText={formData.name}
          value={formData.slug}
          onChange={(slug: string) => {
            onChange("slug", slug);
            validateSlug(slug);
          }}
          prefix="categories/"
          error={slugError || errors?.slug}
        />
      </div>

      {/* Meta Title */}
      <FormInputComponent
        label="Meta Title"
        name="metaTitle"
        value={formData.metaTitle}
        onChange={(e) => onChange("metaTitle", e.target.value)}
        maxLength={60}
        placeholder={`${formData.name || "Category"} - Shop on ${siteName}`}
        error={errors?.metaTitle}
        helperText={`${formData.metaTitle.length}/60 characters • Leave empty to use category name`}
      />

      {/* Meta Description */}
      <FormTextareaComponent
        label="Meta Description"
        name="metaDescription"
        value={formData.metaDescription}
        onChange={(e) => onChange("metaDescription", e.target.value)}
        maxLength={160}
        rows={3}
        placeholder="Browse our collection of quality products in this category..."
        error={errors?.metaDescription}
        helperText={`${formData.metaDescription.length}/160 characters • Appears in search results`}
      />

      {/* Search Engine Preview */}
      <div className="rounded-lg bg-green-50 border border-green-200 p-4">
        <p className="text-sm font-medium text-green-900 mb-2">
          Search Engine Preview
        </p>
        <div className="text-sm">
          <p className="text-blue-600 font-medium truncate">
            {formData.metaTitle || formData.name || "Category Name"} -{" "}
            {siteName}
          </p>
          <p className="text-green-700 text-xs truncate">
            {baseUrl}/categories/{formData.slug || "category-slug"}
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

export default CategorySeoStep;
