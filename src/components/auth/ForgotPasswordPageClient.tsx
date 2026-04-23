"use client";
import { ForgotPasswordView, useForgotPassword } from "@mohasinac/appkit/client";

export function ForgotPasswordPageClient() {
  const forgot = useForgotPassword();

  return (
    <ForgotPasswordView
      onSubmit={async (email) => {
        await forgot.mutateAsync({ email });
      }}
      isLoading={forgot.isPending}
      error={forgot.error?.message ?? null}
      success={forgot.isSuccess ? "Password reset email sent. Check your inbox." : null}
    />
  );
}
