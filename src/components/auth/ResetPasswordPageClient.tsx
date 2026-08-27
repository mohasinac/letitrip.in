"use client";
import { normalizeError } from "@mohasinac/appkit/client";
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
          // `reset` already surfaced this, and ResetPasswordView renders
          // `reset.error` inline as well. Swallow so it is said once.
          void normalizeError(err);
        }
      }}
      isLoading={reset.isPending}
      error={reset.error?.message ?? null}
      success={reset.isSuccess ? "Your password has been reset." : null}
    />
  );
}
