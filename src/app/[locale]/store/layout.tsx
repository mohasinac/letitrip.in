import { Suspense, type ReactNode } from "react";
import { DashboardLayoutClient, RoleGuard } from "@mohasinac/appkit/client";
import type { StoreNavGroup } from "@mohasinac/appkit/client";
import { isAdminUser } from "@mohasinac/appkit/features/auth/role-predicates";
import { safeRead } from "@mohasinac/appkit/errors/safe-read";
import { storeRepository } from "@mohasinac/appkit/features/stores/repository/store.repository";
import { STORE_NAV_GROUPS } from "@/constants/navigation";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";
import { filterStoreNavGroups } from "@/lib/store-nav";
import { getServerSessionUser } from "@/lib/firebase/auth-server";

export default async function StoreLayout({ children }: { children: ReactNode }) {
  const user = await getServerSessionUser();
  /*
   * Six env feature flags used to filter this sidebar by matching hardcoded nav
   * LABELS. Both flag systems were deleted 2026-08-29 (every flag was `true`
   * everywhere), so the only surviving rule is the one that was never a flag:
   * Bundles is hidden unconditionally, as it always was.
   *
   * Label-matching is the part worth losing. `if (item.label === "Prize Draws")`
   * breaks silently on a rename, and three other layouts carried their own
   * divergent copy of this filter — W6 replaces all four with one
   * permission/id-driven mechanism.
   */
  /*
   * Nav ids for listing types this store may NOT create.
   *
   * 🛑 Resolved SERVER-side, from the store document. `capabilities` is listed
   * in PRIVATE_STORE_FIELDS, so it is absent from every public store payload —
   * a client-side filter has nothing to read and would either show everything
   * or guess. This layout already awaits the session, which is what makes the
   * whole /store subtree per-request (the sanctioned lever, Root Cause #89), so
   * the store read costs one round trip on a route that was never static.
   *
   * Hiding the nav is UX only. The refusal that matters is server-side in
   * `assertListingTypeAllowed`, called from createSellerProduct and
   * sellerUpdateProduct — a seller who types the URL still cannot publish.
   */
  const store =
    user && !isAdminUser(user)
      ? /*
         * `safeRead`, not a bare await. Next still ATTEMPTS to prerender pages
         * under a session-reading layout — the HTML is discarded, but an
         * unguarded throw during the attempt is fatal to the production build.
         * A failed read here must degrade to "show the basic types only", which
         * is the safe direction: it hides nav the seller may be entitled to
         * rather than offering nav they are not, and the server-side gate is
         * what actually decides either way.
         */
        await safeRead(() => storeRepository.findByOwnerId(user.uid), {
          route: "/store",
          key: "store-layout:nav-entitlements",
          fallback: null,
        })
      : null;
  /*
   * 🛑 The filter itself MOVED to `@/lib/store-nav` when the store dashboard
   * hubs needed the same answer. It is imported, never re-derived: a hub
   * offering a card for a listing type this store cannot create would promise a
   * page that refuses the seller at save time. See that function's header.
   */
  const groups = filterStoreNavGroups(STORE_NAV_GROUPS as StoreNavGroup[], {
    isPrivileged: !user || isAdminUser(user),
    capabilities: store?.capabilities,
  });

  return (
    <RoleGuard role={["seller", "admin"]}>
      <DashboardLayoutClient
        variant="store"
        groups={groups}
        crossNav={{
          profileHref: String(ROUTES.USER.PROFILE),
          adminHref: user && isAdminUser(user) ? String(ROUTES.ADMIN.DASHBOARD) : undefined,
        }}
      >
        <Suspense>{children}</Suspense>
      </DashboardLayoutClient>
    </RoleGuard>
  );
}
