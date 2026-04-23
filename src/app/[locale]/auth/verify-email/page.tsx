import { Suspense } from "react";
import { VerifyEmailPageClient } from "@/components/auth/VerifyEmailPageClient";

export default function Page() {
  return (
    <Suspense>
      <VerifyEmailPageClient />
    </Suspense>
  );
}
