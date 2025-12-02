"use client";

import { FormInput, FormSelect } from "@/components/forms";
import type { StepProps } from "./types";

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
