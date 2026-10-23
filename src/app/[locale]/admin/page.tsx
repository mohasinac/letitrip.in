import { notFound } from "next/navigation";
import { getServerSessionUser } from "@/lib/firebase/auth-server";
import { getServerPermissions } from "@mohasinac/appkit/server";
import { getDashboardHubData } from "@mohasinac/appkit/server";
import { DashboardHubView } from "@mohasinac/appkit/features/dashboard/components/DashboardHubView";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import { ADMIN_NAV_GROUPS } from "@/constants/navigation";

/**
 * `/admin` — the sectioned index of the admin panel.
 *
 * ## What this replaced, and what it did NOT replace
 *
 * This file was six lines: `redirect(ROUTES.ADMIN.DASHBOARD)`. So `/admin` —
 * the URL anyone types or bookmarks first — was a hop to the metrics screen,
 * and there was nowhere at all that answered "what is in the admin panel".
 * 101 screens across twelve sections were discoverable only by scrolling a
 * sidebar whose group headers are collapsed on mobile.
 *
 * 🛑 `/admin/dashboard` is untouched and stays the metrics screen. The sidebar
 * still has its "Dashboard" entry pointing there, and this page has its own
 * ("All sections"). Collapsing the two would either bury the figures under a
 * card wall or leave the index unreachable.
 *
 * ## `notFound()` rather than `redirect()` on a missing session
 *
 * The layout above already redirects an unauthenticated or
 * under-permissioned visitor, so reaching here without a session means the
 * layout's guard did not run — which is a fault, not a visitor to redirect.
 * A second redirect would paper over it.
 */
export default async function Page() {
  const user = await getServerSessionUser();
  if (!user) notFound();

  const resolved = await getServerPermissions(user.uid);
  /*
   * `null` means admin — the convention `filterNavGroups` owns, and the same
   * expression `admin/layout.tsx` uses to feed the sidebar. Both resolve
   * through one function so a card cannot appear for a screen the sidebar
   * hides.
   *
   * `userRepository.findById` is cached per request inside `BaseRepository`, so
   * this costs nothing on top of the layout's own call.
   */
  const permissions = resolved.isAdmin ? null : resolved.permissions;

  const { sections, counts } = await getDashboardHubData(ADMIN_NAV_GROUPS, permissions);

  return (
    <DashboardHubView
      title="Admin panel"
      description="Every section, with a sentence on what each screen is for. Numbers show what is waiting."
      mode="sections"
      sections={sections}
      sectionHrefs={Object.fromEntries(
        sections.map((s) => [s.slug, String(ROUTES.ADMIN.SECTION(s.slug))]),
      )}
      counts={counts}
    />
  );
}
