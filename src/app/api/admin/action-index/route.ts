import { withProviders } from "@/providers.config";

/**
 * GET  /api/admin/action-index — the whole index, unprojected, plus a sync report.
 * PATCH /api/admin/action-index — write one override, or replace the custom list.
 *
 * The admin's control plane over every navigable and actionable surface (D7).
 * It absorbs `siteSettings.navConfig`, `/admin/navigation` and
 * `/admin/settings/navigation` — the two nav editors that, per the master
 * plan's own re-verification, reach no sidebar at all because no nav item had
 * an id until W6 gave it one.
 *
 * ## 🛑 Validation happens HERE, not only on CI
 *
 * `audit-action-index` reads files. An admin-authored entry is written at
 * runtime, so a bad href would reach the sidebar and the search, 404 for
 * everyone, and stay until the next audit run. Without this route repeating
 * those checks, "admins can author entries" is a self-service 404 generator.
 *
 * ## `sync` reports; it never writes
 *
 * An entry an admin deliberately hid must not silently reappear because a
 * deploy re-ran a seeder. The diff is shown; applying it is a separate,
 * deliberate act.
 */

import { createApiHandler as createRouteHandler, successResponse, errorResponse } from "@mohasinac/appkit";
import {
  actionIndexRepository,
  validateActionIndexEntry,
  safeRead,
} from "@mohasinac/appkit/server";
import {
  mergeActionIndex,
  normalizeError,
  ROUTES,
  type ActionIndexEntry,
  type ActionIndexOverride,
} from "@mohasinac/appkit";
import { ROLES_ADMIN_ONLY } from "@/constants";
import { ACTION_INDEX_BASE } from "@/constants/action-index";
import { SITE_SETTINGS_TAB_IDS } from "@mohasinac/appkit";

/**
 * Every route the app serves, flattened out of the route map.
 *
 * Derived rather than listed: a hand-written allow-list would drift from the
 * router the first time a page was added, and this is the set a save-time href
 * check is only as good as.
 */
function collectRoutes(node: unknown, out: Set<string>): Set<string> {
  if (typeof node === "string") {
    if (node.startsWith("/")) out.add(node.replace(/\/+$/, "") || "/");
    return out;
  }
  if (typeof node === "function") {
    /*
     * A dynamic route builder. Called with a placeholder so the SHAPE lands in
     * the set — `/admin/orders/[id]` — which is what `matchesKnownRoute`
     * compares segment-wise. Calling it is safe: every builder in the map is a
     * pure template literal.
     */
    try {
      const shaped = (node as (...args: string[]) => unknown)("[id]", "[id]", "[id]");
      if (typeof shaped === "string" && shaped.startsWith("/")) out.add(shaped);
    } catch (err) {
      // A builder needing a different arity is skipped rather than guessed at.
      void normalizeError(err);
    }
    return out;
  }
  if (node && typeof node === "object") {
    for (const value of Object.values(node)) collectRoutes(value, out);
  }
  return out;
}

const KNOWN_ROUTES = collectRoutes(ROUTES, new Set<string>());

/** The only route with a declared tab union so far — see W8 for the rest. */
const KNOWN_TABS: Record<string, ReadonlySet<string>> = {
  [String(ROUTES.ADMIN.SITE)]: new Set(SITE_SETTINGS_TAB_IDS),
};

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "settings:write",
    handler: async () => {
      const control = await safeRead(() => actionIndexRepository.getControl(), {
        route: "/api/admin/action-index",
        key: "actionIndex/global",
        fallback: undefined,
      });

      const entries = mergeActionIndex(ACTION_INDEX_BASE, control);

      /*
       * The sync report: what the code now has that the stored document has
       * never seen, and what it overrides that no longer exists. Reported, not
       * applied — see the header.
       */
      const baseIds = new Set(ACTION_INDEX_BASE.map((e) => e.id));
      const overriddenIds = Object.keys(control?.entries ?? {});
      const sync = {
        added: ACTION_INDEX_BASE.filter((e) => !(e.id in (control?.entries ?? {}))).length,
        orphanedOverrides: overriddenIds.filter((id) => !baseIds.has(id)),
        customCount: control?.custom?.length ?? 0,
      };

      return successResponse({ entries, control, sync });
    },
  }),
);

interface PatchBody {
  entryId?: string;
  /*
   * The typed override shape, not `Record<string, unknown>`. What an admin may
   * change about a built-in entry is a closed set — label, description,
   * keywords, weight, group, order, enabled — and an open record here would
   * let a caller write `href` or `requiredPermission` straight through, which
   * is exactly the boundary D7 draws between content and routing.
   */
  override?: ActionIndexOverride;
  clear?: boolean;
  custom?: ActionIndexEntry[];
}

export const PATCH = withProviders(
  createRouteHandler<PatchBody>({
    auth: true,
    roles: [...ROLES_ADMIN_ONLY],
    permission: "settings:write",
    handler: async ({ body, user }) => {
      const actor = user!.uid;

      if (body?.custom) {
        /*
         * Every custom entry validated before ANY is written. A partial write
         * would leave the admin with some of their edits applied and a 400
         * explaining one of them, which is the worst of both.
         */
        const issues = body.custom.flatMap((entry, i) =>
          validateActionIndexEntry(entry, {
            knownRoutes: KNOWN_ROUTES,
            knownTabs: KNOWN_TABS,
            // An entry may reuse a built-in id deliberately, to supersede it —
            // see `mergeActionIndex`. Only collisions WITHIN the custom list
            // are a mistake.
            existingIds: new Set(body.custom!.slice(0, i).map((e) => e.id)),
          }).map((issue) => ({ ...issue, index: i, id: entry.id })),
        );
        if (issues.length > 0) {
          return errorResponse("Some entries could not be saved", 400, {
            code: "INVALID_ACTION_INDEX_ENTRY",
            issues,
          });
        }
        await actionIndexRepository.setCustomEntries(body.custom, actor);
        return successResponse({ ok: true }, "Custom entries saved");
      }

      if (!body?.entryId) {
        return errorResponse("entryId is required", 400, { code: "MISSING_ENTRY_ID" });
      }

      if (body.clear) {
        await actionIndexRepository.clearOverride(body.entryId, actor);
        return successResponse({ ok: true }, "Override cleared");
      }

      await actionIndexRepository.setOverride(body.entryId, body.override ?? {}, actor);
      return successResponse({ ok: true }, "Entry updated");
    },
  }),
);
