import { redirect } from "@/i18n/navigation";

// S-STORE-2-F
export default function Page() {
  redirect("/store/products?listingType=bundle");
}
