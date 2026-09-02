import React from "react";
import { ServerErrorsListView } from "@mohasinac/appkit/client";
import { listServerErrors, safeRead } from "@mohasinac/appkit/server";

// Guarded for the same reason as the sibling server-errors page — see the note
// there. This one filters `code in [...]`, so it needs the `(code ASC,
// occurredAt DESC)` composite, which had the same wrong direction.
export default async function PaymentRollbacksPage(): Promise<React.JSX.Element> {
  const rows = await safeRead(
    () =>
      listServerErrors({
        days: 30,
        codes: [
          "PAYMENT_ROLLBACK_ATTEMPTED",
          "PAYMENT_ROLLBACK_FAILED",
          "UPSTREAM_UNAVAILABLE",
        ],
        limit: 200,
      }),
    { route: "/admin/maintenance/payment-rollbacks", key: "listServerErrors.rollbacks", fallback: [] },
  );
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
