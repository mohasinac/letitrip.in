import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";

export const metadata: Metadata = _gm({
  title: "Report a Problem — LetItRip",
  description:
    "Report a listing, a seller or a buyer to the LetItRip trust team. Every report is reviewed.",
  path: "/report",
});

import { Suspense } from "react";
import { ReportFormClient } from "./report-form-client";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string; entityId?: string }>;
}) {
  const sp = await searchParams;
  return (
    <Suspense>
      <ReportFormClient
        initialEntityType={sp.entityType ?? "product"}
        initialEntityId={sp.entityId ?? ""}
      />
    </Suspense>
  );
}
