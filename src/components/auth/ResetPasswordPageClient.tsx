"use client";
import { useSearchParams } from "next/navigation";
import { ResetPasswordView, useResetPassword } from "@mohasinac/appkit/client";

export function ResetPasswordPageClient() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode") ?? "";
  const reset = useResetPassword();

  return (
    <ResetPasswordView
      oobCode={oobCode}
      onSubmit={async (code, newPassword) => {
        await reset.mutateAsync({ token: code, newPassword });
      }}
      isLoading={reset.isPending}
      error={reset.error?.message ?? null}
      success={reset.isSuccess ? "Your password has been reset." : null}
    />
  );
}
