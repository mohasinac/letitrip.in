"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  FirebaseClientAuthProvider,
  ForgotPasswordView,
  ROUTES,
} from "@mohasinac/appkit/client";
import Link from "next/link";

const authProvider = new FirebaseClientAuthProvider();

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(email: string) {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await authProvider.sendPasswordResetEmail(email);
      setSuccess("Password reset email sent. Check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <ForgotPasswordView
      onSubmit={handleSubmit}
      isLoading={loading}
      error={error}
      success={success}
      renderBackLink={() => (
        <Link href={String(ROUTES.AUTH.LOGIN)}>Back to login</Link>
      )}
    />
  );
}