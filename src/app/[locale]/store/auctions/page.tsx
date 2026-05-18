import { redirect } from "@/i18n/navigation";

// S-STORE-2-F — consolidated to /store/products?listingType=auction.
// /new + /[id]/edit retained for the dedicated create/edit flow.
export default function Page() {
  redirect("/store/products?listingType=auction");
}
