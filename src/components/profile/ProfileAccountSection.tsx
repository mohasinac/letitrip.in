/**
 * Profile Account Section Component
 */

import { Card, Button } from "@/components";
import { FormField } from "@/components/FormField";
import { Heading } from "@/components/typography/Typography";
import Text from "@/components/Text";
import { THEME_CONSTANTS } from "@/constants/theme";
import { useForm } from "@/hooks/useForm";
import { apiClient } from "@/lib/api-client";

interface AccountSectionProps {
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onDeleteSuccess: () => void;
}

export function ProfileAccountSection({
  onSuccess,
  onError,
  onDeleteSuccess,
}: AccountSectionProps) {
  const { themed } = THEME_CONSTANTS;

  const deleteForm = useForm({
    initialValues: { password: "", confirmation: "" },
    onSubmit: async (values) => {
      const response = await apiClient.post("/api/profile/delete-account", {
        password: values.password,
      });

      if (response.success) {
        onSuccess("Account deleted successfully");
        onDeleteSuccess();
      } else {
        onError(response.error || "Failed to delete account");
      }
    },
    validate: (values) => {
      const errors: Record<string, string> = {};
      if (values.confirmation !== "DELETE") {
        errors.confirmation = 'Please type "DELETE" to confirm';
      }
      if (!values.password) {
        errors.password = "Password is required";
      }
      return errors;
    },
  });

  return (
    <Card className={`${themed.bgSecondary} border-red-300`}>
      <Heading level={3} className="text-red-600">
        Danger Zone
      </Heading>

      <Text className={`${themed.textSecondary} mt-4`}>
        Once you delete your account, there is no going back. This action is
        permanent and will delete all your data including products, orders, and
        profile information.
      </Text>

      <form onSubmit={deleteForm.handleSubmit} className="space-y-4 mt-6">
        <FormField
          label="Password"
          name="password"
          type="password"
          value={deleteForm.values.password}
          onChange={(value: string) =>
            deleteForm.handleChange("password", value)
          }
          error={deleteForm.errors.password}
        />

        <FormField
          label='Type "DELETE" to confirm'
          name="confirmation"
          value={deleteForm.values.confirmation}
          onChange={(value: string) =>
            deleteForm.handleChange("confirmation", value)
          }
          error={deleteForm.errors.confirmation}
        />

        <Button
          type="submit"
          variant="secondary"
          disabled={deleteForm.isSubmitting}
          className="bg-red-600 hover:bg-red-700"
        >
          {deleteForm.isSubmitting ? "Deleting..." : "Delete Account"}
        </Button>
      </form>
    </Card>
  );
}
