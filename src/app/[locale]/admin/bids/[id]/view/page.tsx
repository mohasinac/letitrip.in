import { BidDetailPageClient } from "@/components/bids/BidDetailPageClient";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";

export const metadata = { title: "Bid — Admin" };

export default function Page() {
  return (
    <BidDetailPageClient
      viewer="admin"
      backHref={String(ROUTES.ADMIN.BIDS)}
      backLabel="Back to bids"
    />
  );
}
