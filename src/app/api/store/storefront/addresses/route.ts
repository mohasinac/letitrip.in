import { withProviders } from "@/providers.config";
/**
 * GET /api/store/store/addresses — List pickup addresses for the seller's store.
 *
 * The seller's store slug is resolved from their user record.
 * Returns an array of AddressDocument objects (ownerType:"store" filter).
 *
 * Mutations (create/update/delete) use Server Actions.
 */

import { storeRepository, addressesRepository } from "@mohasinac/appkit";
import { successResponse } from "@mohasinac/appkit";
import { createApiHandler as createRouteHandler } from "@mohasinac/appkit";
import { NotFoundError } from "@mohasinac/appkit";
import { ERROR_MESSAGES } from "@mohasinac/appkit";
import { ROLES_STORE_WRITE } from "@/constants";

// rbac-scope-enforced-in-handler: store section — handler scopes queries by storeId + actor uid
export const GET = withProviders(createRouteHandler({
  auth: true,
  roles: [...ROLES_STORE_WRITE],
  handler: async ({ user }) => {
    const store = await storeRepository.findByOwnerId(user!.uid);
    if (!store?.storeSlug)
      throw new NotFoundError(ERROR_MESSAGES.GENERIC.NOT_FOUND);

    const addresses = await addressesRepository.listByOwner("store", store.storeSlug);
    return successResponse(addresses);
  },
}));
