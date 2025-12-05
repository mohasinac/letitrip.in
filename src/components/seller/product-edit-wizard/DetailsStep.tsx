/**
 * @fileoverview React Component
 * @module src/components/seller/product-edit-wizard/DetailsStep
 * @description This file contains the DetailsStep component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { FormTextarea } from "@/components/forms/FormTextarea";
import { FormSelect } from "@/components/forms/FormSelect";
import type { StepProps } from "./types";

/**
 * Function: Details Step
 */
/**
 * Performs details step operation
 *
 * @param {StepProps} { formData, setFormData } - The { form data, set form data }
 *
 * @returns {any} The detailsstep result
 *
 * @example
 * DetailsStep({ formData, setFormData });
 */

/**
 * Performs details step operation
 *
 * @param {StepProps} { formData, setFormData } - The { form data, set form data }
 *
 * @returns {any} The detailsstep result
 *
 * @example
 * DetailsStep({ formData, setFormData });
 */

export function DetailsStep({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-4">
      <FormTextarea
        id="edit-product-description"
        label="Description"
        rows={6}
        value={formData.description}
        onChange={(e) =>
          setFormData({ ...formData, description: e.target.value })
        }
      />

      <FormSelect
        id="edit-product-condition"
        label="Condition"
        required
        value={formData.condition}
        onChange={(e) =>
          setFormData({
            ...formData,
            /** Condition */
            condition: e.target.value as any,
          })
        }
        options={[
          { value: "new", label: "New" },
          { value: "refurbished", label: "Refurbished" },
          { value: "used", label: "Used" },
        ]}
      />
    </div>
  );
}

export default DetailsStep;
