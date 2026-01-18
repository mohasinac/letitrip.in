import React from "react";

export interface CategoryDisplayStepData {
  name: string;
  slug: string;
  parentCategory: string;
  icon: string;
  displayOrder: string;
  isActive: boolean;
  featured: boolean;
}

export interface CategoryDisplayStepProps {
  formData: CategoryDisplayStepData;
  categories: Array<{ id: string; name: string }>;
  onChange: (field: string, value: any) => void;
  errors?: Record<string, string>;
  // Component injection for framework independence
  FormInputComponent?: React.ComponentType<{
    label: string;
    type?: string;
    name: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    min?: number;
    error?: string;
    helperText?: string;
  }>;
}

/**
 * Category Display Step - Framework Independent
 *
 * Form step for configuring category display settings including
 * display order, active status, and featured status with summary.
 */
export function CategoryDisplayStep({
  formData,
  categories,
  onChange,
  errors,
  FormInputComponent,
}: CategoryDisplayStepProps) {
  // Fallback component if injection is missing
  if (!FormInputComponent) {
    return (
      <div className="p-4 border border-red-300 bg-red-50 rounded-md">
        <p className="text-red-600 text-sm">
          Missing form component injection. Please provide FormInputComponent.
        </p>
      </div>
    );
  }

  const parentName = formData.parentCategory
    ? categories.find((c) => c.id === formData.parentCategory)?.name
    : "Top Level";

  return (
    <div className="space-y-6">
      {/* Category Summary */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 space-y-3">
        <h3 className="font-medium text-gray-900">Category Summary</h3>
        <div className="grid gap-3 sm:grid-cols-2 text-sm">
          <div>
            <span className="text-gray-600">Name:</span>
            <p className="font-medium text-gray-900 mt-1">
              {formData.name || "—"}
            </p>
          </div>
          <div>
            <span className="text-gray-600">URL:</span>
            <p className="font-medium text-gray-900 mt-1">
              /categories/{formData.slug || "slug"}
            </p>
          </div>
          <div>
            <span className="text-gray-600">Parent:</span>
            <p className="font-medium text-gray-900 mt-1">{parentName}</p>
          </div>
          <div>
            <span className="text-gray-600">Icon:</span>
            <p className="font-medium text-gray-900 mt-1 text-2xl">
              {formData.icon}
            </p>
          </div>
        </div>
      </div>

      {/* Display Order */}
      <FormInputComponent
        label="Display Order"
        type="number"
        name="displayOrder"
        value={formData.displayOrder}
        onChange={(e) => onChange("displayOrder", e.target.value)}
        min={0}
        error={errors?.displayOrder}
        helperText="Lower numbers appear first (0 = highest priority)"
      />

      {/* Checkbox Settings */}
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="isActive"
            checked={formData.isActive}
            onChange={(e) => onChange("isActive", e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="isActive" className="text-sm">
            <span className="font-medium text-gray-900">Active</span>
            <p className="text-gray-600">
              Make this category visible to customers
            </p>
          </label>
        </div>

        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="featured"
            checked={formData.featured}
            onChange={(e) => onChange("featured", e.target.checked)}
            className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="featured" className="text-sm">
            <span className="font-medium text-gray-900">Featured Category</span>
            <p className="text-gray-600">
              Highlight in featured sections and promotions
            </p>
          </label>
        </div>
      </div>

      {/* Warning for inactive category */}
      {!formData.isActive && (
        <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-4">
          <p className="text-sm text-yellow-800">
            ⚠️ This category will be created as inactive. You can activate it
            later from category settings.
          </p>
        </div>
      )}
    </div>
  );
}

export default CategoryDisplayStep;
