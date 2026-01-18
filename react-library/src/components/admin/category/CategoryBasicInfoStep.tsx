import React from "react";

export interface CategoryBasicInfoStepData {
  name: string;
  parentCategory: string;
  description: string;
}

export interface CategoryBasicInfoStepProps {
  formData: CategoryBasicInfoStepData;
  categories: Array<{ id: string; name: string }>;
  onChange: (field: keyof CategoryBasicInfoStepData, value: string) => void;
  errors?: Record<string, string>;
  // Component injection for framework independence
  FormInputComponent?: React.ComponentType<{
    label: string;
    required?: boolean;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    error?: string;
    helperText?: string;
  }>;
  FormSelectComponent?: React.ComponentType<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    placeholder?: string;
    error?: string;
    helperText?: string;
    options: Array<{ value: string; label: string }>;
  }>;
  FormTextareaComponent?: React.ComponentType<{
    label: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    placeholder?: string;
    error?: string;
    helperText?: string;
    rows?: number;
  }>;
}

/**
 * Category Basic Info Step - Framework Independent
 *
 * Form step for entering basic category information including
 * name, parent category, and description.
 */
export function CategoryBasicInfoStep({
  formData,
  categories,
  onChange,
  errors,
  FormInputComponent,
  FormSelectComponent,
  FormTextareaComponent,
}: CategoryBasicInfoStepProps) {
  // Fallback components if injections are missing
  if (!FormInputComponent || !FormSelectComponent || !FormTextareaComponent) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="text-red-600 text-sm">
          Missing form component injections. Please provide FormInputComponent,
          FormSelectComponent, and FormTextareaComponent.
        </p>
      </div>
    );
  }

  const parentOptions = [
    { value: "", label: "None (Top Level Category)" },
    ...categories.map((cat) => ({ value: cat.id, label: cat.name })),
  ];

  return (
    <div className="space-y-6">
      <FormInputComponent
        label="Category Name"
        required
        name="name"
        value={formData.name}
        onChange={(e) => onChange("name", e.target.value)}
        placeholder="e.g., Electronics, Fashion, Home & Garden"
        error={errors?.name}
        helperText="Choose a clear, descriptive name for the category"
      />

      <FormSelectComponent
        label="Parent Category"
        name="parentCategory"
        value={formData.parentCategory}
        onChange={(e) => onChange("parentCategory", e.target.value)}
        placeholder="None (Top Level Category)"
        error={errors?.parentCategory}
        options={parentOptions}
        helperText="Select a parent to create a subcategory, or leave empty for a top-level category"
      />

      <FormTextareaComponent
        label="Description"
        name="description"
        value={formData.description}
        onChange={(e) => onChange("description", e.target.value)}
        rows={4}
        placeholder="Brief description of this category and what products it includes..."
        error={errors?.description}
        helperText={`${formData.description.length}/500 characters`}
      />
    </div>
  );
}

export default CategoryBasicInfoStep;
