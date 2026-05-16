import { Suspense } from "react";
import { ResetPasswordPageClient } from "@/components";

export default function Page() {
  return (
    <Suspense>
      <ResetPasswordPageClient />
    </Suspense>
  );
}
