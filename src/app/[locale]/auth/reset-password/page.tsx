import { Suspense } from "react";
import { Spinner } from "@/components";
import { ResetPasswordView } from "@/features/auth";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <Spinner size="xl" variant="primary" />
        </div>
      }
    >
      <ResetPasswordView />
    </Suspense>
  );
}
