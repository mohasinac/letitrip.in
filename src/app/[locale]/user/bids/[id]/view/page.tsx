import { BidDetailPageClient } from "@/components/bids/BidDetailPageClient";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";

export const metadata = { title: "Bid" };

export default function Page() {
  return (
    <BidDetailPageClient
      viewer="buyer"
      backHref={String(ROUTES.USER.BIDS)}
      backLabel="Back to my bids"
    />
  );
}
