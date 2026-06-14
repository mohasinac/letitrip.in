import React from "react";
import { MaintenanceDashboardView } from "@mohasinac/appkit/client";
import { getMaintenanceDashboardCounts } from "@mohasinac/appkit/server";

export const dynamic = "force-dynamic";

export default async function MaintenanceDashboardPage(): Promise<React.JSX.Element> {
  const counts = await getMaintenanceDashboardCounts();
  return <MaintenanceDashboardView counts={counts} basePath="/admin/maintenance" />;
}
