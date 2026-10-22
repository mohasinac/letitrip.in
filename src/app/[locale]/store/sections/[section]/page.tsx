import { notFound } from "next/navigation";
import { isAdminUser } from "@mohasinac/appkit/features/auth/role-predicates";
import { safeRead } from "@mohasinac/appkit/errors/safe-read";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { getDashboardHubData } from "@mohasinac/appkit/_internal/server/features/dashboard/data";
import { DashboardHubView } from "@mohasinac/appkit/features/dashboard/components/DashboardHubView";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import { STORE_NAV_GROUPS } from "@/constants/navigation";
import { filterStoreNavGroups } from "@/lib/store-nav";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

/**
 * One store section's screens.
 *
 * 🛑 The entitlement filter runs here too, through the SAME
 * `filterStoreNavGroups` the layout uses. Deriving these cards from the raw
 * `STORE_NAV_GROUPS` would offer a seller a card for a listing type their store
 * cannot create — the page would open and then refuse them at save time, which
 * is a worse outcome than the nav entry simply not being there.
 *
 * The store read is `safeRead` for the reason the layout documents: Next still
 * ATTEMPTS to prerender pages under a session-reading layout, and an unguarded
 * throw during that attempt is fatal to the production build.
 */
export default async function Page({
  params,
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: slug } = await params;
  const user = await getServerSessionUser();

  const store =
    user && !isAdminUser(user)
      ? await safeRead(() => storeRepository.findByOwnerId(user.uid), {
          route: "/store/sections",
          key: "store-hub:nav-entitlements",
          fallback: null,
        })
      : null;

  const groups = filterStoreNavGroups(STORE_NAV_GROUPS, {
    isPrivileged: !user || isAdminUser(user),
    capabilities: store?.capabilities,
  });

  /*
   * `permissions: undefined` — the store portal has no `requiredPermission` on
   * any item (the seller owns the store), so there is nothing to filter on.
   * 🛑 Not `null`, which `filterNavGroups` reads as ADMIN.
   *
   * `store?.id` is the store SLUG, which is what `OrderDocument.storeId` holds.
   * Passing `user.uid` here would count zero pending orders for every seller
   * and raise nothing — Root Cause #98's second bug.
   */
  const { sections, counts } = await getDashboardHubData(groups, undefined, store?.id);
  const section = sections.find((s) => s.slug === slug);
  if (!section) notFound();

  return (
    <DashboardHubView
      title={section.title}
      description="Every screen in this section, and what each one is for."
      mode="screens"
      sections={[section]}
      sectionHrefs={{ [section.slug]: String(ROUTES.STORE.SECTION(section.slug)) }}
      counts={counts}
    />
  );
}
