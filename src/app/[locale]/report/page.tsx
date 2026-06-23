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
