import React from "react";
import { ServerErrorsListView } from "@mohasinac/appkit/client";
import { listServerErrors } from "@mohasinac/appkit/server";

export const dynamic = "force-dynamic";

export default async function FunctionErrorsPage(): Promise<React.JSX.Element> {
  const rows = await listServerErrors({ source: "function", days: 7, limit: 200 });
  return (
    <ServerErrorsListView
      title="Cloud Function errors"
      subtitle="Last 7 days — exceptions in Firestore triggers, scheduled jobs, and HTTPS callables"
      source="function"
      rows={rows}
      detailHrefBase="/admin/maintenance/server-errors"
    />
  );
}
