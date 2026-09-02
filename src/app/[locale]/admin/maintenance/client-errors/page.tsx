import React from "react";
import { ServerErrorsListView } from "@mohasinac/appkit/client";
import { listServerErrors, safeRead } from "@mohasinac/appkit/server";

// Guarded for the same reason as the sibling server-errors page — see the note
// there. An observability page must degrade to empty, not 500 and not fail the
// production build's prerender attempt.
export default async function ClientErrorsPage(): Promise<React.JSX.Element> {
  const rows = await safeRead(
    () => listServerErrors({ source: "client", days: 7, limit: 200 }),
    { route: "/admin/maintenance/client-errors", key: "listServerErrors.client", fallback: [] },
  );
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
