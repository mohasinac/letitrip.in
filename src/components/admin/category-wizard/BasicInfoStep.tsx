/**
 * @fileoverview React Component
 * @module src/components/admin/category-wizard/BasicInfoStep
 * @description This file contains the BasicInfoStep component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import { FormTextarea } from "@/components/forms/FormTextarea";
import type { CategoryFE } from "@/types/frontend/category.types";
import type { CategoryFormData, OnChange } from "./types";

/**
 * BasicInfoStepProps interface
 * 
 * @interface
 * @description Defines the structure and contract for BasicInfoStepProps
 */
interface BasicInfoStepProps {
  /** Form Data */
  formData: CategoryFormData;
  /** Categories */
  categories: CategoryFE[];
  /** On Change */
  onChange: OnChange;
}

export default /**
 * Performs basic info step operation
 *
 * @param {BasicInfoStepProps} {
  formData,
  categories,
  onChange,
} - The {
  formdata,
  categories,
  onchange,
}
 *
 * @returns {any} The basicinfostep result
 *
 */
function BasicInfoStep({
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
