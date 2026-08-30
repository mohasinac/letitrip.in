import { withProviders } from "@/providers.config";

/**
 * GET /api/action-index
 *
 * The viewer's action index — the static base with the admin's overrides
 * applied, projected to what this viewer may actually reach.
 *
 * ## 🛑 The projection is HERE, not in the browser
 *
 * An entry the viewer cannot act on is one they must not receive. The labels
 * alone are a site map of the admin panel — "Banned Addresses", "Payment
 * Clusters", "Scam Registry" — and D8 is explicit that entry labels ARE the
 * admin site map. Filtering client-side would ship the whole thing and hide it
 * with CSS.
 *
 * ## Cache
 *
 * `private, max-age=300` — **private** because the body differs per role, and a
 * shared cache serving one viewer's index to another is the exact failure
 * `GET /api/site-settings` was found committing (Root Cause #70). Five minutes
 * because the index only changes when an admin edits it or a deploy ships new
 * entries, and the client holds it for a session anyway.
 *
 * **One request per session per portal, never per keystroke.** Matching runs
 * client-side against the cached list: a read per keystroke would exhaust the
 * 50k/day Firestore free tier at roughly thirty sessions, and a typeahead has
 * to answer in under 16ms, which a network hop cannot.
 */

import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import { mergeActionIndex, projectActionIndexForViewer, isAdminUser } from "@mohasinac/appkit";
import { actionIndexRepository, safeRead } from "@mohasinac/appkit/server";
import { ACTION_INDEX_BASE } from "@/constants/action-index";

export const GET = withProviders(
  createRouteHandler({
    auth: true,
    handler: async ({ user }) => {
      /*
       * A control-document read failure degrades to the STATIC base rather
       * than to an empty index. The overrides are content; the entries are the
       * product — losing the first is cosmetic, losing the second empties the
       * search. `safeRead` records a DEGRADED_READ row, so it is loud to the
       * operator and invisible to the user, which is the opposite of the
       * `.catch(() => null)` shape in Root Cause #59.
       */
      const control = await safeRead(
        () => actionIndexRepository.getControl(),
        { route: "/api/action-index", key: "actionIndex/global", fallback: undefined },
      );

      const merged = mergeActionIndex(ACTION_INDEX_BASE, control);
      const entries = projectActionIndexForViewer(merged, {
        role: user?.role,
        /*
         * Narrowed, not cast. The session user's extra claims are typed
         * `FirestoreValue`, which includes `null` — and `as` here would be the
         * "zero runtime effect, silences the only signal you had" mistake
         * Root Cause #70 records at a client boundary.
         */
        permissions: Array.isArray(user?.permissions)
          ? (user.permissions as string[])
          : undefined,
        isTester: user?.isTester === true,
        isAdmin: isAdminUser(user),
      });

      const res = Response.json({ success: true, data: { entries } });
      res.headers.set("Cache-Control", "private, max-age=300");
      return res;
    },
  }),
);
