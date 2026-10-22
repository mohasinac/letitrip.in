import type { Metadata } from "next";
import { AdminInvoicingView } from "@mohasinac/appkit/features/admin/components/AdminInvoicingView";

/*
 * 🛑 `/admin/invoicing` under FINANCE, not `/admin/maintenance/`.
 *
 * The export contains the company's tax position for a quarter plus every
 * buyer's place of supply. That is not a maintenance diagnostic, and
 * `ROUTE_PERMISSION_MAP` gates this path on `settings:write` — which
 * `maintenance_employee` deliberately does not have, for the same reason
 * `/admin/money-cases` is gated away from it.
 */
export const metadata: Metadata = {
  title: "Invoicing",
  description:
    "Export the invoice and credit-note register for a period as a GSTR-1 draft.",
};

export default function Page() {
  return <AdminInvoicingView />;
}
