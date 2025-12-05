/**
 * @fileoverview React Component
 * @module src/components/seller/shop-wizard/BrandingStep
 * @description This file contains the BrandingStep component and its related functionality
 * 
 * @created 2025-12-05
 * @author mohasinac
 * @see {@link https://mohasin.chinnapattan.com}
 */

"use client";

import OptimizedImage from "@/components/common/OptimizedImage";
import { FormField } from "@/components/forms/FormField";
import { FormInput } from "@/components/forms/FormInput";
import { FormTextarea } from "@/components/forms/FormTextarea";
import type { ShopFormData, OnShopChange } from "./types";

/**
 * BrandingStepProps interface
 * 
 * @interface
 * @description Defines the structure and contract for BrandingStepProps
 */
interface BrandingStepProps {
  /** Form Data */
  formData: ShopFormData;
  /** On Change */
  onChange: OnShopChange;
  /** Errors */
  errors: Record<string, string>;
}

export default /**
 * Performs branding step operation
 *
 * @param {BrandingStepProps} {
  formData,
  onChange,
  errors,
} - The {
  formdata,
  onchange,
  errors,
}
 *
 * @returns {any} The brandingstep result
 *
 */
function BrandingStep({
  formData,
  onChange,
  errors,
}: BrandingStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          label="Logo URL"
          id="logoUrl"
          hint="Paste image URL or upload via media manager"
          error={errors.logoUrl}
        >
          <FormInput
            value={formData.logoUrl || ""}
            onChange={(e) => onChange("logoUrl", e.target.value)}
            placeholder="https://..."
          />
        </FormField>
        <FormField label="Banner URL" id="bannerUrl" error={errors.bannerUrl}>
          <FormInput
            value={formData.bannerUrl || ""}
            onChange={(e) => onChange("bannerUrl", e.target.value)}
            placeholder="https://..."
          />
        </FormField>
      </div>

      {(formData.logoUrl || formData.bannerUrl) && (
        <div className="grid grid-cols-2 gap-6">
          {formData.logoUrl && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Logo Preview</p>
              <OptimizedImage
                src={formData.logoUrl}
                alt="Shop Logo"
                width={160}
                height={160}
                objectFit="contain"
              />
            </div>
          )}
          {formData.bannerUrl && (
            <div>
              <p className="text-sm text-gray-500 mb-2">Banner Preview</p>
              <OptimizedImage
                src={formData.bannerUrl}
                alt="Shop Banner"
                width={600}
                height={200}
                objectFit="cover"
              />
            </div>
          )}
        </div>
      )}

      <FormField
        label="Brand Tagline"
        id="tagline"
        optional
        error={errors.tagline}
      >
        <FormInput
          value={formData.tagline || ""}
          onChange={(e) => onChange("tagline", e.target.value)}
          placeholder="Short catchy tagline"
        />
      </FormField>

      <FormField
        label="About the Brand"
        id="about"
        optional
        error={errors.about}
      >
        <FormTextarea
          value={formData.about || ""}
          onChange={(e) => onChange("about", e.target.value)}
          placeholder="Tell customers about your brand"
        />
      </FormField>
    </div>
  );
}
