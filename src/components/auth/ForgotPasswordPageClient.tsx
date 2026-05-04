"use client";
import { ForgotPasswordView, useForgotPassword, useToast } from "@mohasinac/appkit/client";

export function ForgotPasswordPageClient() {
  const forgot = useForgotPassword();
  const { showToast } = useToast();

  return (
    <ForgotPasswordView
      onSubmit={async (email) => {
        try {
          await forgot.mutateAsync({ email });
          showToast("Password reset email sent. Check your inbox.", "success");
        } catch (err) {
          showToast(err instanceof Error ? err.message : "Failed to send reset email.", "error");
        }
      }}
      isLoading={forgot.isPending}
      error={forgot.error?.message ?? null}
      success={forgot.isSuccess ? "Password reset email sent. Check your inbox." : null}
    />
  );
}
