"use client";
import { Link, useRouter } from "@/i18n/navigation";
import { RegisterForm, useRegister, useToast, ROUTES } from "@mohasinac/appkit/client";

export function RegisterPageClient() {
  const router = useRouter();
  const { showToast } = useToast();

  const register = useRegister({
    onSuccess: () => {
      showToast("Account created! Welcome to LetItRip.", "success");
      router.push(String(ROUTES.HOME));
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
      renderLoginLink={() => (
        <Link
          href={String(ROUTES.AUTH.LOGIN)}
          className="font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          Sign in
        </Link>
      )}
      renderTermsLink={() => (
        <Link
          href={String(ROUTES.PUBLIC.TERMS)}
          className="font-semibold text-primary hover:text-primary/80 transition-colors"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Service
        </Link>
      )}
    />
  );
}
