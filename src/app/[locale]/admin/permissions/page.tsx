import { redirect } from "@/i18n/navigation";
import { ROUTES } from "@mohasinac/appkit";

// W8 C2 — folded into /admin/roles as a tab. Both are `admin:roles:read`, which
// is what made them mergeable; the path stays because `navItemId` strips the
// query, so a nav href carrying `?tab=` would collide with /admin/roles' id.
export default function Page() {
  redirect(`${String(ROUTES.ADMIN.ROLES)}?tab=permissions`);
}
