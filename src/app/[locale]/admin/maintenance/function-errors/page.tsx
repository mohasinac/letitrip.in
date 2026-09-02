import React from "react";
import { ServerErrorsListView } from "@mohasinac/appkit/client";
import { listServerErrors, safeRead } from "@mohasinac/appkit/server";

// Guarded for the same reason as the sibling server-errors page — see the note
// there. An observability page must degrade to empty, not 500 and not fail the
// production build's prerender attempt.
export default async function FunctionErrorsPage(): Promise<React.JSX.Element> {
  const rows = await safeRead(
    () => listServerErrors({ source: "function", days: 7, limit: 200 }),
    { route: "/admin/maintenance/function-errors", key: "listServerErrors.function", fallback: [] },
  );
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
