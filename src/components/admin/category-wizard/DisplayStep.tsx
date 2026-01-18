"use client";

import type { CategoryFE } from "@/types/frontend/category.types";
import {
  FormInput,
  CategoryDisplayStep as LibraryCategoryDisplayStep,
  type CategoryDisplayStepData,
} from "@letitrip/react-library";

// Map local types to library types
type CategoryFormData = CategoryDisplayStepData & { [key: string]: any };
type OnChange = (field: string, value: any) => void;

interface DisplayStepProps {
  formData: CategoryFormData;
  categories: CategoryFE[];
  onChange: OnChange;
  errors?: Record<string, string>;
}

/**
 * Next.js wrapper for CategoryDisplayStep component
 */
export default function DisplayStep({
  formData,
  categories,
  onChange,
  errors,
}: DisplayStepProps) {
  // Map CategoryFE to simple format for library
  const libraryCategories = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
  }));

  return (
    <LibraryCategoryDisplayStep
      formData={formData}
      categories={libraryCategories}
      onChange={onChange}
      errors={errors}
      FormInputComponent={FormInput}
    />
  );
}
