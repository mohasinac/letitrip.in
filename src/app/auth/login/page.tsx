/**
 * Login Page
 *
 * Thin page � all form logic lives in LoginForm (src/features/auth).
 * Wrapped in Suspense because LoginForm uses useSearchParams().
 */

"use client";

import { Suspense } from "react";
import { Spinner } from "@/components";
import { LoginForm } from "@/features/auth";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="xl" variant="primary" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
