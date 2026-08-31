import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit";

// W8 C2 — folded into /store/storefront as a tab; the slug is one field of the
// shop's identity. The path stays because `navItemId` strips the query.
export default function Page() {
  redirect(`${String(ROUTES.STORE.STOREFRONT)}?tab=slug`);
}
