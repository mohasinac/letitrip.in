import { SellerShippingView } from "@mohasinac/appkit/client";
import { API_ROUTES } from "@/constants";

export default function Page() {
  return <SellerShippingView apiBase={API_ROUTES.STORE.SHIPPING} />;
}
