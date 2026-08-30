/**
 * The static action index — every navigable or actionable surface, in one
 * list, DERIVED from the nav groups rather than restated beside them.
 *
 * ## What this makes possible
 *
 * `Search.tsx` has always had a complete quick-links path: the inline filter
 * matches keywords as well as labels, the overlay renders a labelled band, the
 * keyboard index arithmetic accounts for it, and the band's label string
 * exists in `constants/search.ts`. `grep "quickLinks="` returned **zero** —
 * the one real mount passed nine props and not that one.
 *
 * It was not wired because there was nothing to wire it to. Nav lived in three
 * arrays with no shared shape, quick actions in a registry each dashboard page
 * ignored in favour of its own local map, and settings nowhere at all. W6
 * gave every nav item a description, keywords and a derived id; this is the
 * list that falls out of that.
 *
 * ## Derived, never authored
 *
 * A hand-written index beside the arrays it duplicates is the drift this plan
 * has spent every wave undoing — ten enumerations of one union, three option
 * arrays that had each quietly lost a value, fifteen postal rules. An entry
 * here cannot exist without its nav item, and cannot go stale when one is
 * renamed.
 */

import {
  buildActionIndexBase,
  deriveNavEntries,
  deriveSettingsEntries,
  type ActionIndexEntry,
} from "@mohasinac/appkit/client";
import {
  ADMIN_NAV_GROUPS,
  STORE_NAV_GROUPS,
  USER_NAV_GROUPS,
} from "./navigation";
import { ROUTES } from "./routes";

/**
 * The base, in portal order.
 *
 * Admin first so that when two portals share a label — both have "Orders" —
 * the admin row is the one that survives deduplication. That is the right way
 * round: an admin searching "orders" wants every order, and a buyer never
 * receives the admin entry at all, because the index is projected by role
 * server-side before it reaches them.
 */
export const ACTION_INDEX_BASE: ActionIndexEntry[] = buildActionIndexBase(
  /*
   * Settings FIRST, so a control outranks the page it lives on when both
   * match. Someone searching "maintenance" wants the toggle; the settings page
   * matches too, on its own description, and would otherwise win on order
   * alone.
   */
  deriveSettingsEntries(String(ROUTES.ADMIN.SITE)),
  deriveNavEntries([
    { portal: "admin", portalLabel: "Admin", groups: ADMIN_NAV_GROUPS },
    { portal: "store", portalLabel: "Seller", groups: STORE_NAV_GROUPS },
    { portal: "user", portalLabel: "Account", groups: USER_NAV_GROUPS },
  ]),
);
