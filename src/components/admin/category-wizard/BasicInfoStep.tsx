"use client";

import type { CategoryFE } from "@/types/frontend/category.types";
import {
  FormInput,
  FormSelect,
  FormTextarea,
  CategoryBasicInfoStep as LibraryCategoryBasicInfoStep,
  type CategoryBasicInfoStepData,
} from "@letitrip/react-library";

// Map local types to library types
type CategoryFormData = CategoryBasicInfoStepData & { [key: string]: any };
type OnChange = (field: keyof CategoryBasicInfoStepData, value: string) => void;

interface BasicInfoStepProps {
  formData: CategoryFormData;
  categories: CategoryFE[];
  onChange: OnChange;
  errors?: Record<string, string>;
}

/**
 * Next.js wrapper for CategoryBasicInfoStep component
 */
export default function BasicInfoStep({
  formData,
  categories,
  onChange,
  errors,
}: BasicInfoStepProps) {
  // Map CategoryFE to simple format for library
  const libraryCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
  }));

  return (
    <LibraryCategoryBasicInfoStep
      formData={formData}
      categories={libraryCategories}
      onChange={onChange}
      errors={errors}
      FormInputComponent={FormInput as any}
      FormSelectComponent={FormSelect as any}
      FormTextareaComponent={FormTextarea as any}
    />
  );
}
