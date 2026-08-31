import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit";

/*
 * W8 C2 — folded into /store/shipping as a tab. The path stays as a redirect
 * because `navItemId` strips the query, so a nav href carrying `?tab=` would
 * collide with /store/shipping's own id. `/new` and `/[id]/edit` are untouched.
 */
export default function Page() {
  redirect(`${String(ROUTES.STORE.SHIPPING)}?tab=configs`);
}
