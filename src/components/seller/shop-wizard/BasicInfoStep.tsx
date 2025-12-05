"use client";

import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import SlugInput from "@/components/common/SlugInput";
import { FormLabel } from "@/components/forms/FormLabel";
import MobileInput from "@/components/common/MobileInput";
import CategorySelectorWithCreate from "@/components/seller/CategorySelectorWithCreate";
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
        required
      />

      <CategorySelectorWithCreate
        value={formData.category}
        onChange={(categoryId) => onChange("category", categoryId || undefined)}
        placeholder="Select primary category"
        required
      />

      <MobileInput
        value={formData.phone || ""}
        countryCode={formData.countryCode || "IN"}
        onChange={(phone) => onChange("phone", phone)}
        onCountryCodeChange={(code) => onChange("countryCode", code)}
        label="Phone Number"
        required
      />

      <FormInput
        id="shop-email"
        type="email"
        label="Email Address"
        value={formData.email || ""}
        onChange={(e) => onChange("email", e.target.value)}
        placeholder="shop@example.com"
        helperText="Primary email address for customer inquiries"
        required
      />
    </div>
  );
}
