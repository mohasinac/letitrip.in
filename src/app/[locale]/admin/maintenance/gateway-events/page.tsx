import type { Metadata } from "next";
import { AdminGatewayEventsView } from "@mohasinac/appkit/features/admin/components/AdminGatewayEventsView";

export const metadata: Metadata = {
  title: "Gateway events",
  description:
    "Every webhook delivery, recorded verbatim — including event types we have no handler for.",
};

export default function Page() {
  return <AdminGatewayEventsView />;
}
