import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";

// S-STORE-2-F — consolidated to /store/products?listingType=auction.
// /new + /[id]/edit retained for the dedicated create/edit flow.
export default function Page() {
  redirect(`${String(ROUTES.STORE.PRODUCTS)}?listingType=auction`);
}
