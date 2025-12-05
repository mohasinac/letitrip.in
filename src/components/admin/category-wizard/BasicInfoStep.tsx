"use client";

import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextarea } from "@/components/forms/FormTextarea";
import type { CategoryFE } from "@/types/frontend/category.types";
import type { CategoryFormData, OnChange } from "./types";

interface BasicInfoStepProps {
  formData: CategoryFormData;
  categories: CategoryFE[];
  onChange: OnChange;
}

export default function BasicInfoStep({
  formData,
  categories,
  onChange,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-6">
      <FormInput
        label="Category Name"
        required
        value={formData.name}
        onChange={(e) => onChange("name", e.target.value)}
        placeholder="e.g., Electronics, Fashion, Home & Garden"
        helperText="Choose a clear, descriptive name for the category"
      />

      <FormSelect
        label="Parent Category"
        value={formData.parentCategory}
        onChange={(e) => onChange("parentCategory", e.target.value)}
        placeholder="None (Top Level Category)"
        options={categories.map((cat) => ({ value: cat.id, label: cat.name }))}
        helperText="Select a parent to create a subcategory, or leave empty for a top-level category"
      />

      <FormTextarea
        label="Description"
        value={formData.description}
        onChange={(e) => onChange("description", e.target.value)}
        rows={4}
        placeholder="Brief description of this category and what products it includes..."
        helperText={`${formData.description.length}/500 characters`}
      />
    </div>
  );
}
