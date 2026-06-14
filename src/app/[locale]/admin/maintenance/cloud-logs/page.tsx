import React from "react";
import { Div, Heading, Text } from "@mohasinac/appkit";
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
    <Div style={{ padding: "1.5rem", maxWidth: "1000px", margin: "0 auto" }}>
      <Heading level={1} style={{ fontSize: "1.5rem", fontWeight: 600 }}>Cloud Logging</Heading>
      <Text as="p" style={{ color: "var(--appkit-color-text-muted)", marginTop: "0.5rem" }}>
        Live stream of Cloud Logging entries (Vercel + Cloud Functions + Cloud Run).
      </Text>
      <Text as="p" style={{ marginTop: "1rem", padding: "1rem", background: "var(--appkit-color-warning-surface)", border: "1px solid var(--appkit-color-warning)", borderRadius: 6 }}>
        Cloud Logging REST integration pending. For now, use the Cloud Console
        log explorer or the structured rows in <code>/admin/maintenance/server-errors</code>,
        <code>/admin/maintenance/function-errors</code>, and{" "}
        <code>/admin/maintenance/client-errors</code>.
      </Text>
    </Div>
  );
}
