import { Suspense } from "react";
import { ResetPasswordPageClient } from "@/components/auth/ResetPasswordPageClient";

export default function Page() {
  return (
    <Suspense>
      <ResetPasswordPageClient />
    </Suspense>
  );
}
