/**
 * @fileoverview React Component
 * @module src/components/seller/product-edit-wizard/InventoryStep
 * @description This file contains the InventoryStep component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import { FormInput } from "@/components/forms/FormInput";
import { FormSelect } from "@/components/forms/FormSelect";
import type { StepProps } from "./types";

/**
 * Function: Inventory Step
 */
/**
 * Performs inventory step operation
 *
 * @param {StepProps} { formData, setFormData } - The { form data, set form data }
 *
 * @returns {any} The inventorystep result
 *
 * @example
 * InventoryStep({ formData, setFormData });
 */

/**
 * Performs inventory step operation
 *
 * @param {StepProps} { formData, setFormData } - The { form data, set form data }
 *
 * @returns {any} The inventorystep result
 *
 * @example
 * InventoryStep({ formData, setFormData });
 */

export function InventoryStep({ formData, setFormData }: StepProps) {
  return (
    <div className="space-y-4">
      <FormInput
        id="edit-product-stock"
        label="Stock Count"
        type="number"
        required
        min={0}
        value={formData.stockCount}
        onChange={(e) =>
          setFormData({
            ...formData,
            /** Stock Count */
            stockCount: parseInt(e.target.value) || 0,
          })
        }
      />

      <FormInput
        id="edit-product-sku"
        label="SKU"
        helperText="Optional product identifier"
        value={formData.sku}
        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
      />

      <FormSelect
        id="edit-product-status"
        label="Status"
        required
        value={formData.status}
        onChange={(e) =>
          setFormData({
            ...formData,
            /** Status */
            status: e.target.value as any,
          })
        }
        options={[
          { value: "draft", label: "Draft" },
          { value: "published", label: "Published" },
          { value: "archived", label: "Archived" },
        ]}
      />
    </div>
  );
}

export default InventoryStep;
