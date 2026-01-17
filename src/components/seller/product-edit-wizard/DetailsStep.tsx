"use client";

import { FormTextarea } from "@letitrip/react-library";
import { FormSelect } from "@letitrip/react-library";
import type { StepProps } from "./types";

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
