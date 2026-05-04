"use client";
import { useSearchParams } from "next/navigation";
import { ResetPasswordView, useResetPassword, useToast } from "@mohasinac/appkit/client";

export function ResetPasswordPageClient() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode") ?? "";
  const reset = useResetPassword();
  const { showToast } = useToast();

  return (
    <ResetPasswordView
      oobCode={oobCode}
      onSubmit={async (code, newPassword) => {
        try {
          await reset.mutateAsync({ token: code, newPassword });
          showToast("Your password has been reset successfully.", "success");
        } catch (err) {
          showToast(err instanceof Error ? err.message : "Failed to reset password.", "error");
        }
      }}
      isLoading={reset.isPending}
      error={reset.error?.message ?? null}
      success={reset.isSuccess ? "Your password has been reset." : null}
    />
  );
}
