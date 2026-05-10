import { SellerAddressesView } from "@mohasinac/appkit";
import { API_ROUTES } from "@/constants/api";

export default function Page() {
  return <SellerAddressesView apiBase={API_ROUTES.STORE.ADDRESSES} />;
}
