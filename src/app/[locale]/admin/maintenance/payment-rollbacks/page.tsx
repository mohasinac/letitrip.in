import React from "react";
import { ServerErrorsListView } from "@mohasinac/appkit/client";
import { listServerErrors } from "@mohasinac/appkit/server";

export const dynamic = "force-dynamic";

export default async function PaymentRollbacksPage(): Promise<React.JSX.Element> {
  const rows = await listServerErrors({
    days: 30,
    codes: [
      "PAYMENT_ROLLBACK_ATTEMPTED",
      "PAYMENT_ROLLBACK_FAILED",
      "UPSTREAM_UNAVAILABLE",
    ],
    limit: 200,
  });
  return (
    <ServerErrorsListView
      title="Payment rollbacks"
      subtitle="Last 30 days — Razorpay refund attempts and upstream-unavailable errors"
      source="all"
      rows={rows}
      detailHrefBase="/admin/maintenance/server-errors"
    />
  );
}
