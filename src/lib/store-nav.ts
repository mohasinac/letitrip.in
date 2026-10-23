import { navItemId } from "@mohasinac/appkit";
import { listingTypesAllowedFor } from "@mohasinac/appkit";
import type { ListingType } from "@mohasinac/appkit/features/products/types/index";
/* The published client entry — there is no ./_internal/* subpath. */
import type { SidebarNavGroup } from "@mohasinac/appkit/client";
import {
  STORE_LISTING_TYPE_ROUTES,
  STORE_LISTINGS_GROUP_TITLE,
} from "@/constants/navigation";
import { ROUTES } from "@mohasinac/appkit/next/routing/route-map";

/**
 * Which store nav entries this seller may see — the one answer, shared by the
 * store sidebar and the store dashboard hubs.
 *
 * ## 🛑 Why this is not inline in `store/layout.tsx` any more
 *
 * It was, and the hubs needed the same answer. Copying it would have produced
 * the failure the hubs exist to avoid: the sidebar hides Bundles and every
 * listing type this store is not entitled to create, so a hub derived from the
 * raw `STORE_NAV_GROUPS` would render cards for pages the sidebar does not
 * offer — and a hub card is a promise the page will open, not a link in a list.
 *
 * That is Root Cause #75's shape exactly, and the branch most likely to be lost
 * by a copy is the entitlement one, because it is the one that depends on a
 * Firestore read the copy might not bother making.
 *
 * ## Two filters, two different reasons
 *
 * - **Bundles** is a scope decision (P-1), not a flag and not an entitlement.
 *   It is hidden unconditionally, as it always has been.
 * - **Listing types** come from the store's own `capabilities`, which is in
 *   `PRIVATE_STORE_FIELDS` and therefore absent from every public store
 *   payload. That is why the caller must resolve the store server-side and pass
 *   `capabilities` in: a client-side filter has nothing to read and would
 *   either show everything or guess.
 *
 * Both are UX only. The refusal that matters is `assertListingTypeAllowed` in
 * `createSellerProduct` / `sellerUpdateProduct` — a seller who types the URL
 * still cannot publish.
 *
 * 🛑 Keyed on the nav ID, never the LABEL. A label match breaks silently the
 * day someone renames an entry to "Bundle deals": the filter stops matching,
 * the item reappears, and nothing says so. Three layouts each carried their own
 * divergent label-matching copy of this before W6.
 */
export function filterStoreNavGroups<T extends SidebarNavGroup>(
  groups: readonly T[],
  opts: {
    /** `true` for an admin or an unauthenticated prerender — show every type. */
    isPrivileged: boolean;
    /** From the store document, server-resolved. Absent degrades to basic types. */
    capabilities?: readonly string[] | null;
  },
): T[] {
  const allowed = new Set(
    listingTypesAllowedFor({
      isPrivileged: opts.isPrivileged,
      capabilities: opts.capabilities,
    }),
  );
  const hiddenListingNavIds = new Set(
    (Object.entries(STORE_LISTING_TYPE_ROUTES) as [ListingType, string][])
      .filter(([type]) => !allowed.has(type))
      .map(([, href]) => navItemId("store", href)),
  );
  const bundlesId = navItemId("store", String(ROUTES.STORE.BUNDLES));

  return groups
    .map((group) =>
      group.title === STORE_LISTINGS_GROUP_TITLE
        ? {
            ...group,
            items: group.items.filter(
              (item) =>
                item.id !== bundlesId &&
                /*
                 * `id` is optional, and `SidebarNavItem` documents an absent one
                 * as "always visible — no admin toggle". Honour that rather
                 * than hiding an id-less item: entitlement filtering is keyed
                 * on the id, so no id means nothing to key on.
                 */
                !(item.id && hiddenListingNavIds.has(item.id)),
            ),
          }
        : group,
    )
    .filter((group) => group.items.length > 0) as T[];
}
