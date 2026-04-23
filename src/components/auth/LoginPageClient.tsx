"use client";
import { useRouter } from "next/navigation";
import { LoginForm, useLogin, useGoogleLogin } from "@mohasinac/appkit/client";

export function LoginPageClient() {
  const router = useRouter();
  const login = useLogin({ onSuccess: () => router.push("/") });
  const googleLogin = useGoogleLogin({ onSuccess: () => router.push("/") });

  return (
    <LoginForm
      onSubmit={async (values) => {
        await login.mutateAsync(values);
      }}
      onGoogleLogin={() => googleLogin.mutate()}
      isLoading={login.isPending || googleLogin.isLoading}
      error={login.error?.message ?? null}
    />
  );
}
