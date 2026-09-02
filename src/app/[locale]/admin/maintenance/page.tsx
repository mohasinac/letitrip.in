import React from "react";
import { MaintenanceDashboardView } from "@mohasinac/appkit/client";
import { getMaintenanceDashboardCounts, safeRead } from "@mohasinac/appkit/server";

// Guarded for the same reason as the sibling error-list pages — see the note in
// server-errors/page.tsx. The dashboard is the entry point to the whole
// observability section; it 500-ing takes the section's front door with it.
export default async function MaintenanceDashboardPage(): Promise<React.JSX.Element> {
  const counts = await safeRead(() => getMaintenanceDashboardCounts(), {
    route: "/admin/maintenance",
    key: "getMaintenanceDashboardCounts",
    fallback: {
      last24h: 0,
      last7d: 0,
      last30d: 0,
      bySource: { vercel: 0, client: 0, function: 0 },
      topCodes: [],
      topRoutes: [],
    },
  });
  return <MaintenanceDashboardView counts={counts} basePath="/admin/maintenance" />;
}
