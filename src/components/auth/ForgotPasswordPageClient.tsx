"use client";
import { normalizeError } from "@mohasinac/appkit/client";
import { ForgotPasswordView, useForgotPassword, useToast } from "@mohasinac/appkit/client";

export function ForgotPasswordPageClient() {
  const forgot = useForgotPassword();
  const { showToast } = useToast();

  return (
    <ForgotPasswordView
      onSubmit={async (email) => {
        // Always show the same generic message regardless of outcome —
        // Firebase's client SDK can throw auth/user-not-found for a
        // nonexistent email, and surfacing that raw would let an attacker
        // enumerate registered accounts. This mirrors the no-enumeration
        // behavior the old server-side route used to provide explicitly.
        try {
          await forgot.mutateAsync({ email });
        } catch (err) {
          // Swallowed ON PURPOSE — security, not laziness. The success toast
          // below is shown unconditionally so a failed send is indistinguishable
          // from a successful one; surfacing the error here would turn this form
          // into an account-enumeration oracle.
          void normalizeError(err);
        } finally {
          showToast("If an account exists for that email, a reset link is on its way.", "success");
        }
      }}
      isLoading={forgot.isPending}
      error={null}
      success={forgot.isSuccess ? "If an account exists for that email, a reset link is on its way." : null}
    />
  );
}
