import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants/seo.server";
import { AdminOrdersGuideView } from "@mohasinac/appkit/features/admin/components/AdminOrdersGuideView";

export const metadata: Metadata = _gm({
  title: "Orders & Finance Guide — Admin | LetItRip",
  description: "Admin guide: order statuses, dispute intervention, payouts, returns, and commission math on LetItRip.",
  path: "/admin/guide/orders",
});

export default function Page() {
  return <AdminOrdersGuideView />;
}
