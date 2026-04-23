"use client";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { VerifyEmailView, useVerifyEmail } from "@mohasinac/appkit/client";

export function VerifyEmailPageClient() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode") ?? "";
  const verify = useVerifyEmail();

  useEffect(() => {
    if (oobCode) {
      verify.mutate({ token: oobCode });
    }
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const status = verify.isPending || (!verify.isSuccess && !verify.isError)
    ? "loading"
    : verify.isSuccess
    ? "success"
    : "error";

  return (
    <VerifyEmailView
      status={status}
      error={verify.error?.message ?? null}
    />
  );
}
