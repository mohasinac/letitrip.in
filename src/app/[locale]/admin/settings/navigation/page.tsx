import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit";

// W8 C2 — folded into /admin/settings/actions as a tab. Both write the same
// `siteSettings` singleton under `admin:settings:write`; the path stays because
// `navItemId` strips the query.
export default function Page() {
  redirect(`${String(ROUTES.ADMIN.SETTINGS_ACTIONS)}?tab=navigation`);
}
