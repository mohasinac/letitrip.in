import { Suspense } from "react";
import { AuthClosePageClient } from "./AuthClosePageClient";

export default function Page() {
  return (
    <Suspense>
      <AuthClosePageClient />
    </Suspense>
  );
}
