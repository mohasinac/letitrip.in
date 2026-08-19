import React from "react";
import { CloudLogsListView } from "@mohasinac/appkit/client";
import { listCloudLogEntries } from "@mohasinac/appkit/server";

export const dynamic = "force-dynamic";

/**
 * Google Cloud Logging entries for this project's Firebase Functions
 * (2nd-gen — resource.type="cloud_run_revision", see
 * `listCloudLogEntries`'s doc comment). Initial page renders server-side;
 * `CloudLogsListView` drives further pages client-side via `nextPageToken`
 * against `/api/admin/maintenance/cloud-logs`.
 */
export default async function CloudLogsPage(): Promise<React.JSX.Element> {
  const { entries, nextPageToken } = await listCloudLogEntries({ pageSize: 50 });
  return (
    <CloudLogsListView
      title="Cloud Logging"
      subtitle="Last 24 hours — Firebase Functions (Cloud Run revisions)"
      initialEntries={entries}
      initialNextPageToken={nextPageToken}
    />
  );
}
