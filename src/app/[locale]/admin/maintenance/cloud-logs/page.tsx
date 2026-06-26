import React from "react";
import { Alert, Div, Heading, Text } from "@mohasinac/appkit";
export const dynamic = "force-dynamic";

/**
 * Cloud Logging proxy view. The `@google-cloud/logging` dep + Cloud Logging
 * REST integration is deferred — for now the page renders a placeholder so
 * the route is reachable and gated by the maintenance RBAC perm.
 *
 * When the proxy lands, this page becomes a thin client wrapper around the
 * `/api/admin/maintenance/cloud-logs` endpoint and renders a live entry list.
 */
export default function CloudLogsPage(): React.JSX.Element {
  return (
    <Div className="max-w-[1000px] mx-auto" padding="lg">
      <Heading level={1} size="xl" weight="semibold">Cloud Logging</Heading>
      <Text className="mt-2 text-[var(--appkit-color-text-muted)]">
        Live stream of Cloud Logging entries (Vercel + Cloud Functions + Cloud Run).
      </Text>
      <Alert variant="warning" className="mt-4">
        Cloud Logging REST integration pending. For now, use the Cloud Console
        log explorer or the structured rows in <code>/admin/maintenance/server-errors</code>,
        <code>/admin/maintenance/function-errors</code>, and{" "}
        <code>/admin/maintenance/client-errors</code>.
      </Alert>
    </Div>
  );
}
