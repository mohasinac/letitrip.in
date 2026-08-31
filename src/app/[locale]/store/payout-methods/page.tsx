import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit";

/*
 * W8 C2 — folded into /store/payouts as a tab.
 *
 * The path stays as a redirect rather than being deleted: the nav entry, its
 * `navItemId`, its `navConfig` toggle key and its action-index entry are all
 * derived from this href, and `navItemId` strips the query — so a nav entry
 * pointing at `?tab=methods` would collide with /store/payouts' own id. The
 * `/new` and `/[id]/edit` routes under this path are untouched.
 */
export default function Page() {
  redirect(`${String(ROUTES.STORE.PAYOUTS)}?tab=methods`);
}
