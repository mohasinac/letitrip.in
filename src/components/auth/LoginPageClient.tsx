"use client";
import { useRouter } from "next/navigation";
import { LoginForm, useLogin, useGoogleLogin, useSession, useToast, ROUTES } from "@mohasinac/appkit/client";

export function LoginPageClient() {
  const router = useRouter();
  const { refreshUser } = useSession();
  const { showToast } = useToast();

  const login = useLogin({
    onSuccess: () => {
      showToast("Signed in successfully", "success");
      router.push(String(ROUTES.HOME));
    },
    onError: (err) => {
      showToast(err instanceof Error ? err.message : "Sign-in failed. Please try again.", "error");
    },
  });

  const googleLogin = useGoogleLogin({
    onSessionSynced: async () => {
      await refreshUser();
    },
    onSuccess: () => {
      showToast("Signed in with Google", "success");
      router.refresh();
      router.push(String(ROUTES.HOME));
    },
    onError: (err) => {
      showToast(err instanceof Error ? err.message : "Google sign-in failed. Please try again.", "error");
    },
  });

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
