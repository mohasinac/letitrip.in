import { Suspense } from "react";
import { Spinner } from "@/components";
import { ResetPasswordView } from "@/features/auth";
import { THEME_CONSTANTS } from "@/constants";

export default function ResetPasswordPage() {
  const { flex } = THEME_CONSTANTS;
  return (
    <Suspense
      fallback={
        <div className={`${flex.center} min-h-screen`}>
          <Spinner size="xl" variant="primary" />
        </div>
      }
    >
      <ResetPasswordView />
    </Suspense>
  );
}
