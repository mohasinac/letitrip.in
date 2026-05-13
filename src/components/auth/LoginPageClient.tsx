"use client";
import Link from "next/link";
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
      labels={{ subtitle: "Don't have an account?" }}
      renderCreateAccountLink={() => (
        <Link
          href={String(ROUTES.AUTH.REGISTER)}
          className="font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Create one
        </Link>
      )}
      renderForgotPasswordLink={() => (
        <Link
          href={String(ROUTES.AUTH.FORGOT_PASSWORD)}
          className="text-sm text-primary hover:text-primary/80 transition-colors"
        >
          Forgot password?
        </Link>
      )}
    />
  );
}
