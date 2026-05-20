import type { Metadata } from "next";
import { generateMetadata as _gm } from "@/constants";
import { AdminOrdersGuideView } from "@mohasinac/appkit";

export const metadata: Metadata = _gm({
  title: "Orders & Finance Guide — Admin | LetItRip",
  description: "Admin guide: order statuses, dispute intervention, payouts, returns, and commission math on LetItRip.",
  path: "/admin/guide/orders",
});

export const revalidate = 3600;

export default function Page() {
  return <AdminOrdersGuideView />;
}
