"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import {
  FirebaseClientAuthProvider,
  ResetPasswordView,
  ROUTES,
} from "@mohasinac/appkit/client";
import Link from "next/link";

const authProvider = new FirebaseClientAuthProvider();

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode") ?? "";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(code: string, newPassword: string) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await authProvider.confirmPasswordReset(code, newPassword);
      setSuccess("Password updated. You can now sign in.");
      router.push(String(ROUTES.AUTH.LOGIN));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ResetPasswordView
      oobCode={oobCode}
      onSubmit={handleSubmit}
      isLoading={loading}
      error={error}
      success={success}
      renderLoginLink={() => (
        <Link href={String(ROUTES.AUTH.LOGIN)}>Back to login</Link>
      )}
    />
  );
}