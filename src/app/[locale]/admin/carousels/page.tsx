import React, { Suspense } from "react";
import { AdminCarouselView } from "@mohasinac/appkit/client";

export const dynamic = "force-dynamic";

export default function AdminCarouselsPage() {
  return (
    <Suspense>
      <AdminCarouselView />
    </Suspense>
  );
}
