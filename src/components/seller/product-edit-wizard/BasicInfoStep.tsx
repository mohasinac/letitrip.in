/**
 * @fileoverview React Component
 * @module src/components/seller/product-edit-wizard/BasicInfoStep
 * @description This file contains the BasicInfoStep component and its related functionality
 * 
 * @created 2025-12-05
 * @author Development Team
 */

"use client";

import SlugInput from "@/components/common/SlugInput";
import { FormInput } from "@/components/forms/FormInput";
import { FormLabel } from "@/components/forms/FormLabel";
import CategorySelectorWithCreate from "@/components/seller/CategorySelectorWithCreate";
import type { StepProps } from "./types";

/**
 * Function: Basic Info Step
 */
/**
 * Performs basic info step operation
 *
 * @param {StepProps} { formData, setFormData } - The { form data, set form data }
 *
 * @returns {any} The basicinfostep result
 *
 * @example
 * BasicInfoStep({ formData, setFormData });
 */

/**
 * Performs basic info step operation
 *
 * @param {StepProps} { formData, setFormData } - The { form data, set form data }
 *
 * @returns {any} The basicinfostep result
 *
 * @example
 * BasicInfoStep({ formData, setFormData });
 */

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

      <FormInput
        id="edit-product-price"
        label="Price (₹)"
        type="number"
        required
        min={0}
        step={0.01}
        value={formData.price}
        onChange={(e) =>
          setFormData({
            ...formData,
            /** Price */
            price: parseFloat(e.target.value) || 0,
          })
        }
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
