import { Suspense } from "react";
import { CartRouteClient } from "@/components";

export default function Page() {
  return (
    <Suspense>
      <CartRouteClient />
    </Suspense>
  );
}
