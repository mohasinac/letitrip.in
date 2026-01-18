"use client";

import { FormInput, OptimizedImage } from "@letitrip/react-library";
import type { CategoryFormData, OnChange } from "./types";

interface MediaStepProps {
  formData: CategoryFormData;
  onChange: OnChange;
}

export default function MediaStep({ formData, onChange }: MediaStepProps) {
  return (
    <div className="space-y-6">
      <FormInput
        label="Category Image URL"
        type="url"
        value={formData.imageUrl}
        onChange={(e) => onChange("imageUrl", e.target.value)}
        placeholder="https://example.com/category-image.jpg"
        helperText="Square image recommended (400x400px or larger)"
      />

      {formData.imageUrl && (
        <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Image Preview
          </p>
          <div className="relative w-full max-w-sm h-48">
            <OptimizedImage
              src={formData.imageUrl}
              alt="Category preview"
              width={384}
              height={192}
              className="object-cover rounded-lg border border-gray-200 w-full h-full"
            />
          </div>
        </div>
      )}

      <FormInput
        label="Category Icon"
        value={formData.icon}
        onChange={(e) => onChange("icon", e.target.value)}
        placeholder="📁 or icon name"
        maxLength={50}
        helperText="Use emoji or Lucide icon name (e.g., 📱 for Electronics)"
      />

      <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
        <p className="text-sm font-medium text-blue-900 mb-2">Icon Preview</p>
        <div className="flex items-center gap-3">
          <span className="text-4xl">{formData.icon}</span>
          <div className="text-sm text-blue-800">
            <p className="font-medium">{formData.name || "Category Name"}</p>
            <p className="text-blue-600">This is how your icon will appear</p>
          </div>
        </div>
      </div>
    </div>
  );
}
