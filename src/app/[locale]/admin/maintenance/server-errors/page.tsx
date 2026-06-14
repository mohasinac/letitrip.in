import React from "react";
import { ServerErrorsListView } from "@mohasinac/appkit/client";
import { listServerErrors } from "@mohasinac/appkit/server";

export const dynamic = "force-dynamic";

export default async function ServerErrorsPage(): Promise<React.JSX.Element> {
  const rows = await listServerErrors({ source: "vercel", days: 7, limit: 200 });
  return (
    <ServerErrorsListView
      title="Server errors"
      subtitle="Last 7 days — Vercel HTTP route failures (5xx + selected 4xx)"
      source="vercel"
      rows={rows}
      detailHrefBase="/admin/maintenance/server-errors"
    />
  );
}
