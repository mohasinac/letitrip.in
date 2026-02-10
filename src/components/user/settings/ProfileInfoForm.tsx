"use client";

import { useState, useEffect } from "react";
import { FormField, Button, AvatarUpload, Card } from "@/components";
import type { ImageCropData } from "@/components";
import { UI_LABELS, UI_PLACEHOLDERS, THEME_CONSTANTS } from "@/constants";

/**
 * ProfileInfoForm Component
 *
 * Form for editing avatar, display name, and phone.
 * Includes avatar upload with preview.
 *
 * @example
 * ```tsx
 * <ProfileInfoForm
 *   userId="abc123"
 *   initialData={{ displayName: "John Doe", phone: "+1234567890", photoURL: "..." }}
 *   onSubmit={handleUpdate}
 *   isLoading={updating}
 * />
 * ```
 */

export interface ProfileInfoData {
  displayName: string;
  phone: string;
  photoURL?: string;
}

interface ProfileInfoFormProps {
  userId: string;
  initialData: ProfileInfoData;
  onSubmit: (data: ProfileInfoData) => void | Promise<void>;
  onAvatarUploadSuccess?: (
    url: string,
    cropData: ImageCropData,
  ) => void | Promise<void>;
  onRefresh?: () => void | Promise<void>;
  isLoading?: boolean;
}

export function ProfileInfoForm({
  userId,
  initialData,
  onSubmit,
  onAvatarUploadSuccess,
  onRefresh,
  isLoading = false,
}: ProfileInfoFormProps) {
  const [formData, setFormData] = useState<ProfileInfoData>(initialData);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (field: keyof ProfileInfoData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAvatarUploadSuccess = async (
    url: string,
    cropData: ImageCropData,
  ) => {
    setFormData((prev) => ({ ...prev, photoURL: url }));
    if (onAvatarUploadSuccess) {
      await onAvatarUploadSuccess(url, cropData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  const { spacing, typography } = THEME_CONSTANTS;

  return (
    <Card className={spacing.cardPadding}>
      <div className={spacing.stack}>
        <h3 className={typography.cardTitle}>
          {UI_LABELS.PROFILE.PROFILE_INFORMATION}
        </h3>

        <form onSubmit={handleSubmit} className={spacing.stack}>
          {/* Avatar Upload */}
          <div>
            <AvatarUpload
              currentPhotoURL={formData.photoURL}
              userId={userId}
              onUploadSuccess={handleAvatarUploadSuccess}
              onSaveComplete={onRefresh}
            />
          </div>

          {/* Display Name */}
          <FormField
            label={UI_LABELS.FORM.DISPLAY_NAME}
            name="displayName"
            type="text"
            value={formData.displayName}
            onChange={(value) => handleChange("displayName", value)}
            placeholder={UI_PLACEHOLDERS.NAME}
          />

          {/* Phone */}
          <FormField
            label={UI_LABELS.FORM.PHONE}
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={(value) => handleChange("phone", value)}
            placeholder={UI_PLACEHOLDERS.PHONE}
          />

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <Button type="submit" variant="primary" disabled={isLoading}>
              {isLoading ? UI_LABELS.LOADING.DEFAULT : UI_LABELS.ACTIONS.SAVE}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
