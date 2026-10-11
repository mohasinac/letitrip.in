import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";

// S-STORE-2-F
export default function Page() {
  redirect(`${String(ROUTES.STORE.PRODUCTS)}?listingType=prize-draw`);
}
