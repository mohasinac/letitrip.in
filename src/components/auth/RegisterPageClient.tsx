"use client";
import { useRouter } from "next/navigation";
import { RegisterForm, useRegister } from "@mohasinac/appkit/client";

export function RegisterPageClient() {
  const router = useRouter();
  const register = useRegister({ onSuccess: () => router.push("/") });

  return (
    <RegisterForm
      onSubmit={async (values) => {
        await register.mutateAsync(values);
      }}
      isLoading={register.isPending}
      error={register.error?.message ?? null}
    />
  );
}
