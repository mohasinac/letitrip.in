"use client";

import { FormGroup } from "@mohasinac/appkit/ui";
import { Checkbox } from "@mohasinac/appkit/ui";
import { Button } from "@mohasinac/appkit/ui";
import { useState } from "react";
import { FormField } from "@/components";
import { useTranslations } from "next-intl";
import { UI_PLACEHOLDERS, THEME_CONSTANTS } from "@/constants";

/**
 * AddressForm Component
 *
 * Shared form for adding/editing addresses.
 * Accepts initialData for edit mode and onSubmit callback.
 * Uses FormField and THEME_CONSTANTS from Phase 2.
 *
 * @example
 * ```tsx
 * // Add new address
 * <AddressForm onSubmit={handleCreate} onCancel={() => router.back()} />
 *
 * // Edit existing address
 * <AddressForm
 *   initialData={address}
 *   onSubmit={handleUpdate}
 *   onCancel={() => router.back()}
 * />
 * ```
 */

export interface AddressFormData {
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  isDefault?: boolean;
}

interface AddressFormProps {
  initialData?: Partial<AddressFormData>;
  onSubmit: (data: AddressFormData) => void | Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  submitLabel?: string;
}

export function AddressForm({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
  submitLabel,
}: AddressFormProps) {
  const tActions = useTranslations("actions");
  const tLoading = useTranslations("loading");
  const tAddresses = useTranslations("addresses");
  const effectiveLabel = submitLabel ?? tActions("save");
  const [formData, setFormData] = useState<AddressFormData>({
    label: initialData?.label || "",
    fullName: initialData?.fullName || "",
    phone: initialData?.phone || "",
    addressLine1: initialData?.addressLine1 || "",
    addressLine2: initialData?.addressLine2 || "",
    city: initialData?.city || "",
    state: initialData?.state || "",
    postalCode: initialData?.postalCode || "",
    country: initialData?.country || "India",
    isDefault: initialData?.isDefault || false,
  });

  const handleChange = (
    field: keyof AddressFormData,
    value: string | boolean,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const { spacing } = THEME_CONSTANTS;

  return (
    <form onSubmit={handleSubmit} className={spacing.stack}>
      {/* Address Label */}
      <FormField
        label="Address Label"
        name="label"
        type="text"
        value={formData.label}
        onChange={(value) => handleChange("label", value)}
        placeholder="Home, Office, etc."
        required
      />

      {/* Full Name */}
      <FormField
        label="Full Name"
        name="fullName"
        type="text"
        value={formData.fullName}
        onChange={(value) => handleChange("fullName", value)}
        placeholder="Recipient's full name"
        required
      />

      {/* Phone */}
      <FormField
        label="Phone Number"
        name="phone"
        type="tel"
        value={formData.phone}
        onChange={(value) => handleChange("phone", value)}
        placeholder={UI_PLACEHOLDERS.PHONE}
        required
      />

      {/* Address Line 1 */}
      <FormField
        label="Address Line 1"
        name="addressLine1"
        type="text"
        value={formData.addressLine1}
        onChange={(value) => handleChange("addressLine1", value)}
        placeholder="Street address, P.O. box"
        required
      />

      {/* Address Line 2 */}
      <FormField
        label="Address Line 2"
        name="addressLine2"
        type="text"
        value={formData.addressLine2}
        onChange={(value) => handleChange("addressLine2", value)}
        placeholder="Apartment, suite, unit, building, floor, etc."
      />

      {/* City, State, Postal Code Grid */}
      <FormGroup columns={3}>
        <FormField
          label="City"
          name="city"
          type="text"
          value={formData.city}
          onChange={(value) => handleChange("city", value)}
          placeholder="City"
          required
        />

        <FormField
          label="State"
          name="state"
          type="text"
          value={formData.state}
          onChange={(value) => handleChange("state", value)}
          placeholder="State/Province"
          required
        />

        <FormField
          label="Postal Code"
          name="postalCode"
          type="text"
          value={formData.postalCode}
          onChange={(value) => handleChange("postalCode", value)}
          placeholder="Postal/ZIP code"
          required
        />
      </FormGroup>

      {/* Country */}
      <FormField
        label="Country"
        name="country"
        type="text"
        value={formData.country}
        onChange={(value) => handleChange("country", value)}
        placeholder="Country"
        required
      />

      {/* Default Address Checkbox */}
      <Checkbox
        checked={formData.isDefault}
        onChange={(e) => handleChange("isDefault", e.target.checked)}
        label={tAddresses("setDefault")}
      />

      {/* Form Actions */}
      <div className="flex items-center justify-start gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          {tActions("cancel")}
        </Button>

        <Button type="submit" variant="primary" disabled={isLoading}>
          {isLoading ? tLoading("default") : effectiveLabel}
        </Button>
      </div>
    </form>
  );
}

