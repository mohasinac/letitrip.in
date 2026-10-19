/**
 * GET /api/search/scoped?q= — Tier 2. The viewer's own records.
 *
 * ## 🛑 `private, no-store`, and it is not negotiable
 *
 * The response is one person's orders, offers, catalogue and addresses. A
 * shared cache in front of this would serve buyer A's rows to buyer B on a
 * URL that looks identical — the response varies by session cookie and by
 * nothing in the URL, which is precisely the shape that defeats edge
 * caching. `audit-scoped-search-ownership` R3 asserts the header.
 *
 * ## 🛑 A guest never reaches Firestore
 *
 * `auth: true` refuses before the handler runs, and
 * `scopedSourcesFor(viewer)` would return `[]` anyway. Two gates, because
 * the expensive mistake here is not "a guest sees an error", it is "a guest
 * silently gets someone's data".
 *
 * ## Why this is a separate endpoint from the public tier
 *
 * The public tier is an immutable CDN artifact with no request at all. This
 * one is per-viewer, uncacheable, and fires ON SUBMIT rather than per
 * keystroke. Merging them into one endpoint would make the cheap path pay
 * the expensive path's cache headers.
 */
import { withProviders } from "@/providers.config";
import { getAdminDb } from "@mohasinac/appkit/providers/db-firebase";
import { searchEverything } from "@mohasinac/appkit/server";
import {
  assertWithinScopedBudget,
  scopedSourcesFor,
} from "@mohasinac/appkit/server";
import { successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { isAdminUser, isSellerUser } from "@mohasinac/appkit";
import { NextResponse } from "next/server";

/*
 * No `roles` list, deliberately: the scope here IS the query. Every source
 * carries an owner clause built from the verified session (`userId == uid`,
 * `storeId == viewer.storeId`), so a role check would be wrong in both
 * directions — it would admit a seller to another seller's rows if the
 * clause were ever dropped, and it adds nothing while the clause is there.
 *
 * 🛑 And no suppression marker, though CLAUDE.md still documents one for
 * exactly this shape. That escape hatch has been REMOVED:
 * `audit-route-rbac`'s header now states it accepts no such markers, and
 * `audit-no-suppression-comments` fails the build on one. None is needed —
 * `createRouteHandler` with `auth: true` is that audit's recognised pattern,
 * where roles and permission are optional.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ request, user }) => {
      const q = new URL(request.url).searchParams.get("q") ?? "";

      /*
       * 🛑 Three characters, server-side. The client debounces and gates
       * too, but a gate that lives only in the client is not a gate: this
       * endpoint is reachable directly with a session cookie, and a
       * one-character query would scan every source's full window for
       * nothing.
       */
      if (q.trim().length < 3) {
        return successResponse({ q, terms: [], groups: [], totalHits: 0 });
      }

      const viewer = {
        uid: user!.uid,
        role: user!.role,
        /*
         * 🛑 The STORE SLUG, never the uid. `StoreDocument.storeId` is the
         * slug and `ownerId` is the Auth UID — different namespaces by
         * design, and comparing one to the other returns nothing while
         * raising nothing (the bug that made every seller product editor
         * 404 for non-admins, Root Cause #98).
         */
        storeId: (user as { storeId?: string } | undefined)?.storeId ?? null,
        isAdmin: isAdminUser(user),
        isSeller: isSellerUser(user),
      };

      const sources = scopedSourcesFor(viewer);
      if (sources.length === 0) {
        return successResponse({ q, terms: [], groups: [], totalHits: 0 });
      }

      // Throws rather than silently over-reading. A budget nobody enforces
      // is a comment.
      assertWithinScopedBudget(sources);

      const result = await searchEverything(getAdminDb(), q, sources);

      const res = NextResponse.json({ success: true, data: result });
      res.headers.set("Cache-Control", "private, no-store");
      return res;
    },
  }),
);
