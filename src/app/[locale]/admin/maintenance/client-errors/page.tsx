import React from "react";
import { ServerErrorsListView } from "@mohasinac/appkit/client";
import { listServerErrors } from "@mohasinac/appkit/server";

export const dynamic = "force-dynamic";

export default async function ClientErrorsPage(): Promise<React.JSX.Element> {
  const rows = await listServerErrors({ source: "client", days: 7, limit: 200 });
  return (
    <ServerErrorsListView
      title="Client errors"
      subtitle="Last 7 days — window.onerror, unhandledrejection, and React error boundary catches"
      source="client"
      rows={rows}
      detailHrefBase="/admin/maintenance/server-errors"
    />
  );
}
