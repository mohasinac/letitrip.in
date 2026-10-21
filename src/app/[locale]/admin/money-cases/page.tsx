import type { Metadata } from "next";
import { AdminMoneyCasesView } from "@mohasinac/appkit/features/admin/components/AdminMoneyCasesView";

/*
 * 🛑 `/admin/money-cases`, NOT `/admin/maintenance/money-cases`.
 *
 * Maintenance means "something broke, look when you can" and is granted to
 * `maintenance_employee`. A case here can carry the gateway's own `respond_by`
 * — miss it and the chargeback is lost by default whoever was right — and an
 * `amountAtRisk` in real rupees. `ROUTE_PERMISSION_MAP` gates this path on
 * `admin:payment-cases:read`, which that role deliberately does not have.
 */
export const metadata: Metadata = {
  title: "Money cases",
  description:
    "Chargebacks, captured payments with no order, refunds owed, protection claims and grievances.",
};

export default function Page() {
  return <AdminMoneyCasesView />;
}
