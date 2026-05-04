"use client";
import { useRouter } from "next/navigation";
import { RegisterForm, useRegister, useToast } from "@mohasinac/appkit/client";

export function RegisterPageClient() {
  const router = useRouter();
  const { showToast } = useToast();

  const register = useRegister({
    onSuccess: () => {
      showToast("Account created! Welcome to LetItRip.", "success");
      router.push("/");
    },
    onError: (err) => {
      showToast(err instanceof Error ? err.message : "Registration failed. Please try again.", "error");
    },
  });

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
