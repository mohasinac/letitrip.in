"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { RegisterForm, type RegisterFormValues } from "@mohasinac/appkit/features/auth";
import { ROUTES } from "@mohasinac/appkit/constants";
import Link from "next/link";

export default function Page() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(values: RegisterFormValues) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          displayName: values.displayName,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.message ?? "Registration failed.");
      }
      router.push(String(ROUTES.HOME));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <RegisterForm
      onSubmit={handleSubmit}
      isLoading={loading}
      error={error}
      renderLoginLink={() => (
        <Link href={String(ROUTES.AUTH.LOGIN)}>Already have an account? Sign in</Link>
      )}
    />
  );
}