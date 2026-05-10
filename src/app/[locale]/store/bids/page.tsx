import { SellerBidsView } from "@mohasinac/appkit";
import { API_ROUTES } from "@/constants/api";

export default function Page() {
  return <SellerBidsView endpoint={API_ROUTES.STORE.BIDS} />;
}
