"use client";

import {
  FormInput,
  FormLabel,
  FormTextarea,
  CategorySeoStep as LibraryCategorySeoStep,
  SlugInput,
  type CategorySeoStepData,
} from "@letitrip/react-library";

// Map local types to library types
type CategoryFormData = CategorySeoStepData & { [key: string]: any };
type OnChange = (field: keyof CategorySeoStepData, value: string) => void;

interface SeoStepProps {
  formData: CategoryFormData;
  slugError?: string;
  onChange: OnChange;
  validateSlug: (slug: string) => void;
  errors?: Record<string, string>;
}

/**
 * Next.js wrapper for CategorySeoStep component
 */
export default function SeoStep({
  formData,
  slugError,
  onChange,
  validateSlug,
  errors,
}: SeoStepProps) {
  return (
    <LibraryCategorySeoStep
      formData={formData}
      slugError={slugError}
      onChange={onChange}
      validateSlug={validateSlug}
      errors={errors}
      FormInputComponent={FormInput as any}
      FormTextareaComponent={FormTextarea as any}
      FormLabelComponent={FormLabel as any}
      SlugInputComponent={SlugInput as any}
      baseUrl="letitrip.in"
      siteName="Letitrip"
    />
  );
}
