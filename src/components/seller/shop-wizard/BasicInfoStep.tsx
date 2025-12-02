"use client";

import { FormInput, FormTextarea, FormSelect } from "@/components/forms";
import SlugInput from "@/components/common/SlugInput";
import { FormLabel } from "@/components/forms";
import type { ShopFormData, OnChange } from "./types";

interface BasicInfoStepProps {
  formData: ShopFormData;
  onChange: OnChange;
}

export default function BasicInfoStep({
  formData,
  onChange,
}: BasicInfoStepProps) {
  return (
    <div className="space-y-4">
      <FormInput
        id="shop-name"
        label="Shop Name"
        value={formData.name}
        onChange={(e) => onChange("name", e.target.value)}
        placeholder="e.g., Vintage Treasures Emporium"
        helperText="Choose a unique, memorable name for your shop"
        required
      />

      <FormLabel htmlFor="shop-slug">Shop URL Slug</FormLabel>
      <SlugInput
        id="shop-slug"
        value={formData.slug}
        onChange={(v) => onChange("slug", v)}
      />

      <FormTextarea
        id="shop-description"
        label="Description"
        value={formData.description}
        onChange={(e) => onChange("description", e.target.value)}
        placeholder="Tell customers about your shop"
        helperText={`${
          formData.description?.length || 0
        }/500 characters (min 20)`}
      />

      <FormSelect
        id="shop-category"
        label="Primary Category"
        value={formData.category}
        onChange={(e) => onChange("category", e.target.value)}
        options={[
          { value: "", label: "Select a category" },
          { value: "electronics", label: "Electronics" },
          { value: "fashion", label: "Fashion" },
          { value: "home", label: "Home & Kitchen" },
          { value: "toys", label: "Toys & Games" },
        ]}
        helperText="Main category your shop focuses on"
      />
    </div>
  );
}
