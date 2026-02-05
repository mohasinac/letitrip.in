"use client";

/**
 * Reset Password Page
 *
 * Refactored to use API client, hooks, and reusable components
 */

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, Button, Alert } from "@/components";
import { FormField } from "@/components/FormField";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { Heading, Text } from "@/components/typography";
import { useResetPassword } from "@/hooks/useAuth";
import {
  ERROR_MESSAGES,
  ROUTES,
  UI_LABELS,
  UI_PLACEHOLDERS,
} from "@/constants";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [tokenError, setTokenError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setTokenError("Invalid or missing reset token");
    }
  }, [token]);

  const {
    mutate: resetPassword,
    isLoading,
    error,
  } = useResetPassword({
    onSuccess: () => {
      setSuccess(true);
    },
  });

  const handleBlur = (field: string) => () => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setTokenError("Invalid or missing reset token");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      return; // Error shown in FormField
    }

    await resetPassword({
      token,
      newPassword: passwords.newPassword,
    });
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="mb-4 text-green-500">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <Heading level={4} className="mb-2">
            Password Reset Successful!
          </Heading>
          <Text className="text-gray-600 mb-6">
            Your password has been successfully reset. You can now log in with
            your new password.
          </Text>
          <Button
            variant="primary"
            onClick={() => router.push(ROUTES.AUTH.LOGIN)}
            className="w-full"
          >
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <Card className="max-w-md w-full p-8">
        <div className="text-center mb-6">
          <Heading level={4} className="mb-2">
            Reset Your Password
          </Heading>
          <Text className="text-gray-600">Enter your new password below</Text>
        </div>

        {(error || tokenError) && (
          <Alert variant="error" className="mb-4">
            {error?.message || tokenError}
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField
            label="New Password"
            name="newPassword"
            type="password"
            value={passwords.newPassword}
            onChange={(value) =>
              setPasswords({ ...passwords, newPassword: value })
            }
            onBlur={handleBlur("newPassword")}
            touched={touched.newPassword}
            placeholder={UI_PLACEHOLDERS.PASSWORD}
            disabled={isLoading}
            required
          />

          {passwords.newPassword && (
            <PasswordStrengthIndicator password={passwords.newPassword} />
          )}

          <FormField
            label="Confirm New Password"
            name="confirmPassword"
            type="password"
            value={passwords.confirmPassword}
            onChange={(value) =>
              setPasswords({ ...passwords, confirmPassword: value })
            }
            onBlur={handleBlur("confirmPassword")}
            touched={touched.confirmPassword}
            error={
              passwords.confirmPassword &&
              passwords.newPassword !== passwords.confirmPassword
                ? "Passwords do not match"
                : undefined
            }
            placeholder="Confirm new password"
            disabled={isLoading}
            required
          />

          <Button
            type="submit"
            variant="primary"
            disabled={
              isLoading ||
              !passwords.newPassword ||
              !passwords.confirmPassword ||
              passwords.newPassword !== passwords.confirmPassword
            }
            className="w-full"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Text className="text-gray-600 text-sm">
            Remember your password?{" "}
            <Link
              href={ROUTES.AUTH.LOGIN}
              className="text-blue-600 hover:underline"
            >
              Sign in
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          {UI_LABELS.LOADING.DEFAULT}
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
