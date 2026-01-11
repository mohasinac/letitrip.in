"use client";

import SlugInput from "@/components/common/SlugInput";
import { FormCurrencyInput } from "@/components/forms/FormCurrencyInput";
import { FormInput } from "@/components/forms/FormInput";
import { FormLabel } from "@/components/forms/FormLabel";
import CategorySelectorWithCreate from "@/components/seller/CategorySelectorWithCreate";
import type { StepProps } from "./types";

export function BasicInfoStep({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-4">
      <FormInput
        id="edit-product-name"
        label="Product Name"
        required
        value={formData.name}
        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
      />

      <SlugInput
        value={formData.slug}
        sourceText={formData.name}
        onChange={(slug: string) => setFormData({ ...formData, slug })}
      />

      <FormCurrencyInput
        label="Price"
        value={formData.price}
        currency="INR"
        onChange={(value) =>
          setFormData({
            ...formData,
            price: value || 0,
          })
        }
        min={0}
        autoFormat={true}
        required
      />

      <div>
        <FormLabel required>Category</FormLabel>
        <CategorySelectorWithCreate
          value={formData.categoryId}
          onChange={(categoryId) =>
            setFormData({ ...formData, categoryId: categoryId || "" })
          }
          placeholder="Select or create a category"
          required
        />
      </div>
    </div>
  );
}

export default BasicInfoStep;
