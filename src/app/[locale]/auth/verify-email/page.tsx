import { Suspense } from "react";
import { VerifyEmailPageClient } from "@/components";

export default function Page() {
  return (
    <Suspense>
      <VerifyEmailPageClient />
    </Suspense>
  );
}
