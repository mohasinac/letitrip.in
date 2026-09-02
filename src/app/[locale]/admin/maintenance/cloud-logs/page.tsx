import React from "react";
import { CloudLogsListView } from "@mohasinac/appkit/client";
import { listCloudLogEntries } from "@mohasinac/appkit/server";
import { safeRead } from "@mohasinac/appkit/server";

/**
 * Google Cloud Logging entries for this project's Firebase Functions
 * (2nd-gen — resource.type="cloud_run_revision", see
 * `listCloudLogEntries`'s doc comment). Initial page renders server-side;
 * `CloudLogsListView` drives further pages client-side via `nextPageToken`
 * against `/api/admin/maintenance/cloud-logs`.
 *
 * 🛑 The read must not be allowed to throw. This is the ONLY page in the app
 * that calls a Google Cloud API rather than Firestore, and the build machine's
 * credentials have no log-read scope — so an unguarded call here fails the
 * whole production build with `7 PERMISSION_DENIED`, from a page nobody
 * intended to prerender. (Next still ATTEMPTS the render even though
 * `admin/layout.tsx` reads the session; the resulting HTML is discarded and
 * the route stays dynamic, but a throw during the attempt is fatal.)
 *
 * At runtime this is the same guard against a GCP outage or a rotated
 * service-account scope: the page degrades to an empty list and records a
 * DEGRADED_READ instead of 500-ing the whole admin surface.
 */
export default async function CloudLogsPage(): Promise<React.JSX.Element> {
  const { entries, nextPageToken } = await safeRead(
    () => listCloudLogEntries({ pageSize: 50 }),
    {
      route: "/admin/maintenance/cloud-logs",
      key: "listCloudLogEntries",
      fallback: { entries: [], nextPageToken: null },
    },
  );
  return (
    <CloudLogsListView
      title="Cloud Logging"
      subtitle="Last 24 hours — Firebase Functions (Cloud Run revisions)"
      initialEntries={entries}
      initialNextPageToken={nextPageToken}
    />
  );
}
