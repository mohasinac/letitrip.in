import React from "react";
import { ServerErrorsListView } from "@mohasinac/appkit/client";
import { listServerErrors, safeRead } from "@mohasinac/appkit/server";

/*
 * 🛑 The error-log read must not be allowed to throw.
 *
 * `listServerErrors` filters `occurredAt >= since` + `source ==` and orders
 * `occurredAt desc`, which needs a `(source ASC, occurredAt DESC)` composite.
 * `firestore.indexes.json` declared it ASCENDING, so the query has been
 * returning `9 FAILED_PRECONDITION` — an observability page that is itself
 * down, which is the worst possible thing to fail silently. The direction is
 * corrected in `appkit/firebase/base/firestore.indexes.json`, but that only
 * takes effect once indexes are deployed.
 *
 * Guarding here means a missing or still-building index degrades to an empty
 * list plus a DEGRADED_READ record, rather than 500-ing the page — and, since
 * Next attempts to prerender this route even though `admin/layout.tsx` reads
 * the session, rather than failing the whole production build.
 */
export default async function ServerErrorsPage(): Promise<React.JSX.Element> {
  const rows = await safeRead(
    () => listServerErrors({ source: "vercel", days: 7, limit: 200 }),
    { route: "/admin/maintenance/server-errors", key: "listServerErrors.vercel", fallback: [] },
  );
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
