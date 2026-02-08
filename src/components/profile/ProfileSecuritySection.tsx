/**
 * Profile Security Section Component
 */

import { Card, Button } from "@/components";
import { FormField } from "@/components/FormField";
import { Heading } from "@/components/typography/Typography";
import { THEME_CONSTANTS } from "@/constants";
import { useForm } from "@/hooks/useForm";
import { apiClient } from "@/lib/api-client";

interface SecuritySectionProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export function ProfileSecuritySection({
  onSuccess,
  onError,
}: SecuritySectionProps) {
  const { themed } = THEME_CONSTANTS;

  const passwordForm = useForm({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    onSubmit: async (values) => {
      const response = await apiClient.post(
        "/api/profile/update-password",
        values,
      );
      if (response.success) {
        onSuccess("Password updated successfully");
        passwordForm.reset();
      } else {
        onError(response.error || "Failed to update password");
      }
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (values.newPassword !== values.confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
      return errors;
    },
  });

  return (
    <Card className={themed.bgSecondary}>
      <Heading level={3} className={themed.textPrimary}>
        Change Password
      </Heading>

      <form
        onSubmit={passwordForm.handleSubmit}
        className={`${THEME_CONSTANTS.spacing.stack} mt-4`}
      >
        <FormField
          label="Current Password"
          name="currentPassword"
          type="password"
          value={passwordForm.values.currentPassword}
          onChange={(value: string) =>
            passwordForm.handleChange("currentPassword", value)
          }
          error={passwordForm.errors.currentPassword}
        />

        <FormField
          label="New Password"
          name="newPassword"
          type="password"
          value={passwordForm.values.newPassword}
          onChange={(value: string) =>
            passwordForm.handleChange("newPassword", value)
          }
          error={passwordForm.errors.newPassword}
        />

        <FormField
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          value={passwordForm.values.confirmPassword}
          onChange={(value: string) =>
            passwordForm.handleChange("confirmPassword", value)
          }
          error={passwordForm.errors.confirmPassword}
        />

        <Button type="submit" disabled={passwordForm.isSubmitting}>
          {passwordForm.isSubmitting ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </Card>
  );
}
