/**
 * Login Page
 *
 * Thin page — all form logic lives in LoginForm (src/features/auth).
 * Wrapped in Suspense because LoginForm uses useSearchParams().
 */

import { Suspense } from "react";
import { Spinner } from "@/components";
import { LoginForm } from "@/features/auth";
import { THEME_CONSTANTS } from "@/constants";

export default function LoginPage() {
  const { flex } = THEME_CONSTANTS;
  return (
    <Suspense
      fallback={
        <div className={`${flex.center} min-h-screen`}>
          <Spinner size="xl" variant="primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
