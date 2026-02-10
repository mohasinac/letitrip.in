"use client";

import { useState } from "react";
import { FormField, Button, PasswordStrengthIndicator } from "@/components";
import { UI_LABELS, UI_PLACEHOLDERS, THEME_CONSTANTS } from "@/constants";
import { calculatePasswordStrength } from "@/utils";

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
      setError("New passwords do not match");
      return;
    }

    if (isPasswordWeak) {
      setError("Password is too weak. Please use a stronger password.");
      return;
    }

    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
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
      {/* Current Password */}
      <FormField
        label="Current Password"
        name="currentPassword"
        type="password"
        value={currentPassword}
        onChange={(value) => setCurrentPassword(value)}
        placeholder={UI_PLACEHOLDERS.PASSWORD}
        required
      />

      {/* New Password */}
      <div>
        <FormField
          label="New Password"
          name="newPassword"
          type="password"
          value={newPassword}
          onChange={(value) => setNewPassword(value)}
          placeholder="Enter new password"
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
        label="Confirm New Password"
        name="confirmPassword"
        type="password"
        value={confirmPassword}
        onChange={(value) => setConfirmPassword(value)}
        placeholder="Confirm new password"
        required
        error={
          confirmPassword && newPassword !== confirmPassword
            ? "Passwords do not match"
            : undefined
        }
      />

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 dark:text-red-400">{error}</div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={
            isLoading || !currentPassword || !newPassword || !confirmPassword
          }
        >
          {isLoading ? UI_LABELS.LOADING.DEFAULT : "Change Password"}
        </Button>
      </div>
    </form>
  );
}
