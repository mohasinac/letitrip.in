import { BidDetailPageClient } from "@/components/bids/BidDetailPageClient";
import { ROUTES } from "@mohasinac/appkit";

export const metadata = { title: "Bid — Store" };

export default function Page() {
  return (
    <BidDetailPageClient
      viewer="seller"
      backHref={String(ROUTES.STORE.BIDS)}
      backLabel="Back to bids"
    />
  );
}
