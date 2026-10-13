import { withProviders } from "@/providers.config";
import { listBuildableModels } from "@mohasinac/appkit/server";
import { storeRepository } from "@mohasinac/appkit";
import { ApiErrors, successResponse } from "@mohasinac/appkit/next/api/api-response";
import { createRouteHandler } from "@mohasinac/appkit/next/api/routeHandler";
import { ROLES_STORE_WRITE } from "@/constants";

/**
 * GET /api/store/parts/buildable — which complete models this store could
 * assemble right now from the part listings it holds.
 *
 * ## 🛑 The answer is keyed on (part, COLOURWAY), which is the whole point
 *
 * One glossary row can be two physically different units — the Metal Ball ships
 * in silver with L-Drago Guardian and in transparent black with Poison Zurafa,
 * same mould and same stats, not interchangeable, wildly different value. A
 * rollup matching on the part id alone says "you can build an L-Drago" to a
 * seller holding only the black one: confident, specific, wrong, and with
 * nothing to notice until they have the part in their hand.
 *
 * ## 🛑 Store-scoped SERVER-SIDE, never by a client filter
 *
 * The store is resolved from the session's owner, exactly as the assembly
 * endpoint does it. A client passing its own `storeId` would be a filter the
 * caller could drop, and the answer names what another seller holds.
 *
 * Three Firestore round trips regardless of how many parts the seller holds —
 * see `listBuildableModels` for why that is flat rather than per-part.
 */
export const GET = withProviders(
  createRouteHandler({
    auth: true,
    /*
     * 🛑 Roles ONLY, no `permission` — `getServerPermissions()` resolves
     * permissions for "employee" alone, so a permission gate beside a seller
     * role array locks out every seller it is supposed to admit. Same shape as
     * the sibling assemble endpoint, and `audit-permission-role-mismatch`
     * blocks the other spelling.
     */
    roles: [...ROLES_STORE_WRITE],
    handler: async ({ user }) => {
      const store = await storeRepository.findByOwnerId(user!.uid);
      if (!store) return ApiErrors.forbidden("No store found for this account");

      const result = await listBuildableModels(store.id);
      /*
       * `truncated` reaches the client unmodified. It carries two different
       * meanings — a cap was hit, or the rollup failed and returned nothing —
       * and in both cases the caller must render "this may be incomplete"
       * rather than "you can build nothing", which a seller holding a full set
       * would read as a bug in their own inventory.
       */
      return successResponse(result);
    },
  }),
);
