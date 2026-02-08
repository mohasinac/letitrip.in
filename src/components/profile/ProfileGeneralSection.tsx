/**
 * Profile General Section Component
 */

import { useState } from "react";
import { Card, Button } from "@/components";
import { FormField } from "@/components/FormField";
import { Heading } from "@/components/typography/Typography";
import { THEME_CONSTANTS } from "@/constants";
import { useForm } from "@/hooks/useForm";
import { apiClient } from "@/lib/api-client";
import { uploadProfilePhoto } from "@/lib/firebase/storage";

interface GeneralSectionProps {
  user: any;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function ProfileGeneralSection({
  user,
  onSuccess,
  onError,
}: GeneralSectionProps) {
  const { themed } = THEME_CONSTANTS;
  const [uploading, setUploading] = useState(false);

  const form = useForm({
    initialValues: { displayName: user?.displayName || "" },
    onSubmit: async (values) => {
      const response = await apiClient.patch("/api/profile", values);
      if (response.success) {
        onSuccess("Profile updated successfully");
      } else {
        onError(response.error || "Failed to update profile");
      }
    },
  });

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const photoURL = await uploadProfilePhoto(user.uid, file);
      await apiClient.patch("/api/profile", { photoURL });
      onSuccess("Profile photo updated");
    } catch (error: any) {
      onError(error.message || "Failed to upload photo");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className={themed.bgSecondary}>
      <Heading level={3} className={themed.textPrimary}>
        General Information
      </Heading>

      <form
        onSubmit={form.handleSubmit}
        className={`${THEME_CONSTANTS.spacing.stack} mt-4`}
      >
        <FormField
          label="Display Name"
          name="displayName"
          value={form.values.displayName}
          onChange={(value: string) => form.handleChange("displayName", value)}
          error={form.errors.displayName}
        />

        <div>
          <label className={themed.textSecondary}>Profile Photo</label>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={uploading}
          />
        </div>

        <Button type="submit" disabled={form.isSubmitting}>
          {form.isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </form>
    </Card>
  );
}
