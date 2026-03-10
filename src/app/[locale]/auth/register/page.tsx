/**
 * Register Page
 *
 * Thin page — all form logic lives in RegisterForm (src/features/auth).
 * Wrapped in Suspense because RegisterForm uses useSearchParams().
 */

import { Suspense } from "react";
import { Spinner } from "@/components";
import { RegisterForm } from "@/features/auth";
import { THEME_CONSTANTS } from "@/constants";

export default function RegisterPage() {
  const { flex } = THEME_CONSTANTS;
  return (
    <Suspense
      fallback={
        <div className={`${flex.center} min-h-screen`}>
          <Spinner size="xl" variant="primary" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
