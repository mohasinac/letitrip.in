"use client";

import { Button } from "@mohasinac/appkit/ui";
import { useState } from "react";
import { FormField, FormGroup, PasswordStrengthIndicator } from "@/components";
import { useTranslations } from "next-intl";
import { UI_PLACEHOLDERS, THEME_CONSTANTS, ERROR_MESSAGES } from "@/constants";
import { calculatePasswordStrength } from "@mohasinac/appkit/validation";

/**
 * PasswordChangeForm Component
 *
 * Form for changing password with strength indicator.
 * Includes current password, new password, and confirmation fields.
 *
 * @example
 * ```tsx
 * <PasswordChangeForm
 *   onSubmit={handlePasswordChange}
 *   isLoading={updating}
 * />
 * ```
 */

interface PasswordChangeFormProps {
  onSubmit: (
    currentPassword: string,
    newPassword: string,
  ) => void | Promise<void>;
  isLoading?: boolean;
}

export function PasswordChangeForm({
  onSubmit,
  isLoading = false,
}: PasswordChangeFormProps) {
  const tForm = useTranslations("form");
  const tLoading = useTranslations("loading");
  const tActions = useTranslations("actions");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");

  const passwordStrength = calculatePasswordStrength(newPassword);
  const isPasswordWeak = newPassword && passwordStrength.score < 3;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (newPassword !== confirmPassword) {
      setError(ERROR_MESSAGES.VALIDATION.PASSWORD_MISMATCH);
      return;
    }

    if (isPasswordWeak) {
      setError(ERROR_MESSAGES.PASSWORD.TOO_WEAK);
      return;
    }

    if (currentPassword === newPassword) {
      setError(ERROR_MESSAGES.PASSWORD.SAME_AS_CURRENT);
      return;
    }

    await onSubmit(currentPassword, newPassword);

    // Reset form on success
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const { spacing } = THEME_CONSTANTS;

  return (
    <form onSubmit={handleSubmit} className={spacing.stack}>
      <FormGroup columns={1}>
        {/* Current Password */}
        <FormField
          label={tForm("currentPassword")}
          name="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(value) => setCurrentPassword(value)}
          placeholder={UI_PLACEHOLDERS.CURRENT_PASSWORD}
          required
        />

        {/* New Password */}
        <div>
          <FormField
            label={tForm("newPassword")}
            name="newPassword"
            type="password"
            value={newPassword}
            onChange={(value) => setNewPassword(value)}
            placeholder={UI_PLACEHOLDERS.NEW_PASSWORD}
            required
          />
          {newPassword && (
            <div className="mt-2">
              <PasswordStrengthIndicator password={newPassword} />
            </div>
          )}
        </div>

        {/* Confirm New Password */}
        <FormField
          label={tForm("confirmPassword")}
          name="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(value) => setConfirmPassword(value)}
          placeholder={UI_PLACEHOLDERS.CONFIRM_PASSWORD}
          required
          error={
            confirmPassword && newPassword !== confirmPassword
              ? ERROR_MESSAGES.VALIDATION.PASSWORD_MISMATCH
              : undefined
          }
        />
      </FormGroup>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      {/* Submit Button */}
      <div className="flex justify-start pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={
            isLoading || !currentPassword || !newPassword || !confirmPassword
          }
        >
          {isLoading ? tLoading("default") : tActions("changePassword")}
        </Button>
      </div>
    </form>
  );
}
